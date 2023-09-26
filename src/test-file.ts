import {execFile} from "node:child_process";

import {downloadNodeImage, downloadNodeVersion} from "./download-node.js";
import {InvalidVersionError} from "./errors/invalid-version";
import {ExecFileException} from "child_process";
import {NodeVersion} from "./node-versions";
import {Ora} from "ora";
import chalk from "chalk";
import path from "node:path";

export async function testVersion({version, testFile, spinner}: {
    version: NodeVersion;
    testFile: string;
    spinner: Ora
}): Promise<boolean> {
    let nodePath: string;
    let cleanup: () => Promise<void>;

    try {
        ({nodePath, cleanup} = await downloadNodeVersion(version, spinner));
    } catch (err) {
        console.error(`Failed to download ${version.version}`, err)
        throw new InvalidVersionError(version.version, (err as Error));
    }

    try {
        return await runTest({version, nodePath, testFile, spinner});
    } finally {
        await cleanup();
    }
}

export function runTest({version, nodePath, testFile, spinner}: {
    version: NodeVersion;
    nodePath: string;
    testFile: string;
    spinner: Ora
}): Promise<boolean> {
    spinner.text = `Running test for ${version.version}`;
    return new Promise((resolve) => {
        const child = execFile(nodePath, [testFile], (error: ExecFileException | null, stdout: string, stderr: string) => {
            const success = child.exitCode === 0;

            if (success) {
                spinner.succeed(`${chalk.bold(version.version)} passed ${chalk.dim(`(output: ${stdout})`)}`);
            } else {
                spinner.fail(`${chalk.bold(version.version)} failed ${chalk.dim(`(output: ${stdout})`)}`);
            }
            resolve(success);
        });
    });
}


export async function testVersionDocker({version, testFile, spinner}: {
    version: NodeVersion;
    testFile: string;
    spinner: Ora
}): Promise<boolean> {
    let image: string;

    try {
        (image = await downloadNodeImage(version, spinner));
    } catch (err) {
        console.error(`Failed to download ${version.version}`, err)
        throw new InvalidVersionError(version.version, (err as Error));
    }

    return await runTestDocker({version, image, testFile, spinner});
}


export function runTestDocker({version, image, testFile, spinner}: {
    version: NodeVersion;
    image: string;
    testFile: string;
    spinner: Ora
}): Promise<boolean> {
    spinner.text = `Running test for ${version.version}`;
    return new Promise((resolve) => {
//     docker run --rm -v `pwd`:/app node:18.0.0-alpine app/test.cjs

        const child = execFile('docker', ['run', '--rm', '-v', `${path.dirname(testFile)}:/app`, image, `app/${path.basename(testFile)}`], (error: ExecFileException | null, stdout: string, stderr: string) => {
            const success = child.exitCode === 0;

            if (success) {
                spinner.succeed(`${chalk.bold(version.version)} passed ${chalk.dim(`(output: ${stdout})`)}`);
            } else {
                spinner.fail(`${chalk.bold(version.version)} failed ${chalk.dim(`(output: ${stdout})`)}`);
            }
            resolve(success);
        });
    });
}
