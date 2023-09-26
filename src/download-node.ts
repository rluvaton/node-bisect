import assert from 'node:assert';
import {NodeVersion} from './node-versions.js';
import {downloadFile} from './download-file.js';
import path from 'node:path';
import {Ora} from "ora";
import chalk from "chalk";
import {execFile, ExecFileException} from "node:child_process";

const distUrl = "https://nodejs.org/dist";

export async function downloadNodeVersion(version: NodeVersion, spinner: Ora) {
    assert.ok(version, `Version is missing`);
    const folder = getFile(version);

    const downloadPath = `${distUrl}/${version.version}/${folder}`;

    spinner.text = `Downloading ${chalk.bold(version.version)} from ${downloadPath}`;

    const {folderPath, cleanup} = await downloadFile({version: version.version, url: downloadPath, spinner});

    return {
        nodePath: path.join(folderPath, 'bin', 'node'),
        cleanup
    };
}

function getFile(version: NodeVersion) {
    const {platform} = process;

    if (platform === 'darwin') {
        return getFolderForMac(version);
    }

    throw new Error(`Unsupported platform: ${platform}`);
}

function getFolderForMac(version: NodeVersion) {
    const {arch} = process;

    const {files} = version;

    switch (arch) {
        case 'x64':
            assert.ok(files.includes('osx-x64-tar'), 'No executable found!');

            return `node-${version.version}-darwin-x64.tar.gz`;

        case 'arm64':
            assert.ok(files.includes('osx-arm64-tar'), 'No executable found!');

            return `node-${version.version}-darwin-arm64.tar.gz`;

        default:
            throw new Error(`Unsupported architecture: ${arch}`);
    }
}

export async function downloadNodeImage(version: NodeVersion, spinner: Ora) {
    const nodeImage = `node:${version.version.replace('v', '')}-alpine`;

    spinner.text = `Downloading ${chalk.bold(version.version)} from docker (image: ${nodeImage})`;

    return new Promise<string>((resolve, reject) => {
        const child = execFile('docker', ['pull', nodeImage], (error: ExecFileException | null, stdout: string, stderr: string) => {
            if (error) {
                console.error(`Failed to download ${version.version}`, error, stdout, stderr)
                reject(error);
                return;
            }
            resolve(nodeImage);
        });
    });
}
