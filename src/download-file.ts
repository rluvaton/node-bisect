import os from 'node:os';
import fs from 'node:fs/promises';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import path from 'node:path';
import {extract} from 'tar-fs';
import gunzip from 'gunzip-maybe';
import fetchProgress from "fetch-progress";
import ora, {Ora} from 'ora';
import chalk from 'chalk';
import {readdir} from "fs/promises";

let tmpFolder: string;

export async function downloadFile({version, url, spinner}: { version: string, url: string, spinner: Ora }) {
    if (!url.endsWith('tar.gz')) {
        throw new Error('Only tar.gz files are supported (we do not know how to run the tests for other file types)');
    }

    if (!tmpFolder) {
        tmpFolder = await fs.mkdtemp(path.join(os.tmpdir(), 'node-versions-'));
        // console.log(`Created temporary folder ${tmpFolder}`);
    }

    spinner.text = `Preparing to download ${chalk.bold(version)}`;

    try {
        const baseDownloadOutputFolder = path.join(tmpFolder, version);

        spinner.text = 'Creating download folder';
        await fs.mkdir(baseDownloadOutputFolder);

        let outputFolder = path.join(baseDownloadOutputFolder, version);

        const prefixText = `Downloading ${chalk.bold(version)}`;

        spinner.text = `${prefixText} ${chalk.gray(`${url} to ${outputFolder})`)}`;

        const downloadFileRes = await fetchProgress({
            // implement onProgress method
            onProgress(progress) {
                spinner.text = `${prefixText} ${chalk.green(`${(progress as any).percentage.toFixed(2)}%`)}`;

                // A possible progress report you will get
                // {
                //    total: 3333,
                //    transferred: 3333,
                //    speed: 3333,
                //    eta: 33,
                //    percentage: 33
                //    remaining: 3333,
                // }
            },
        })(await fetch(url));

        await pipeline(Readable.fromWeb(downloadFileRes.body as any), gunzip(), extract(outputFolder));

        const foldersInOutput = (await readdir(outputFolder, { withFileTypes: true }))
            .filter(dirent => dirent.isDirectory());

        if(foldersInOutput.length === 1) {
            outputFolder = path.join(outputFolder, foldersInOutput[0].name);
        }

        spinner.text = chalk.green(`${chalk.bold(version)} downloaded successfully`);

        return {
            async cleanup() {
                await fs.rm(outputFolder, {recursive: true, force: true});
            },
            folderPath: outputFolder
        };
    } catch (err) {
        spinner.fail(`Failed to download ${version}`);
        console.error(`Failed to download ${version}`, err)
        throw err;
    }
}

export async function cleanupTmpFolder() {
    if (!tmpFolder) {
        return;
    }
    await fs.rm(tmpFolder, {recursive: true, force: true});
}
