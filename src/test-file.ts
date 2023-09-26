import {execFile} from "node:child_process";

import {downloadNodeVersion} from "./download-node.js";
import {InvalidVersionError} from "./errors/invalid-version";
import {ExecFileException} from "child_process";
import {NodeVersion} from "./node-versions";

export async function testVersion(version: NodeVersion, testFile: string): Promise<boolean> {
    let nodePath: string;
    let cleanup: () => Promise<void>;

    try {
        ({nodePath, cleanup} = await downloadNodeVersion(version));
    } catch (err) {
        throw new InvalidVersionError(version.version, (err as Error));
    }

    try {
        return await runTest({version, nodePath, testFile});
    } finally {
        await cleanup();
    }
}

function runTest({version, nodePath, testFile}: {
    version: NodeVersion;
    nodePath: string;
    testFile: string;
}): Promise<boolean> {
    return new Promise((resolve) => {
        const child = execFile(nodePath, [testFile], (error: ExecFileException | null, stdout: string, stderr: string) => {
            if (error) {
                console.error(`${version.version} failed with`, stderr)
            }

            console.log(`${version.version}\n\nstdout:\n${stdout}\n\nstderr:\n${stderr}\n\n`);

            resolve(child.exitCode === 0);
        });

        child.on('exit', (code) => resolve(code === 0));
    });
}
