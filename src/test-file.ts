import { execFile } from 'node:child_process';
import path from 'node:path';
import type { ChildProcess } from 'node:child_process';

import { downloadNodeImage, downloadNodeVersion } from './download-node.js';
import { InvalidVersionError } from './errors/invalid-version.js';
import { NodeVersion } from './node-versions.js';
import { Ora } from 'ora';
import chalk from 'chalk';

export async function testVersionDist({
  version,
  testFile,
  spinner,
}: {
  version: NodeVersion;
  testFile: string;
  spinner: Ora;
}): Promise<boolean> {
  let nodePath: string;
  let cleanup: () => Promise<void>;

  try {
    ({ nodePath, cleanup } = await downloadNodeVersion(version, spinner));
  } catch (err) {
    console.error(`Failed to download ${version.version}`, err);
    throw new InvalidVersionError(version.version, err as Error);
  }

  try {
    return await runTest({
      version,
      testFile,
      spinner,
      runTestFn: ({ testFile, execCb }) => {
        const child = execFile(nodePath, [testFile], (_: unknown, stdout: string) => execCb({ child, stdout }));
      },
    });
  } finally {
    await cleanup();
  }
}

export async function testVersionDocker({
  version,
  testFile,
  spinner,
}: {
  version: NodeVersion;
  testFile: string;
  spinner: Ora;
}): Promise<boolean> {
  let image: string;

  try {
    image = await downloadNodeImage(version, spinner);
  } catch (err) {
    console.error(`Failed to download ${version.version}`, err);
    throw new InvalidVersionError(version.version, err as Error);
  }

  return await runTest({
    version,
    testFile,
    spinner,
    runTestFn: ({ testFile, execCb }) => {
      const child = execFile(
        'docker',
        ['run', '--rm', '-v', `${path.dirname(testFile)}:/app`, image, `app/${path.basename(testFile)}`],
        (_: unknown, stdout: string) => execCb({ child, stdout }),
      );
    },
  });
}

type RunTestFn = ({
  version,
  testFile,
  execCb,
}: {
  version: NodeVersion;
  testFile: string;
  execCb: ({ child, stdout }: { child: ChildProcess; stdout: string }) => void;
}) => void;

function runTest({
  version,
  testFile,
  spinner,
  runTestFn,
}: {
  version: NodeVersion;
  testFile: string;
  spinner: Ora;
  runTestFn: RunTestFn;
}): Promise<boolean> {
  spinner.text = `Running test for ${version.version}`;
  return new Promise((resolve) => {
    runTestFn({
      version,
      testFile,
      execCb({ child, stdout }) {
        const success = child.exitCode === 0;

        if (success) {
          spinner.succeed(`${chalk.bold(version.version)} passed ${chalk.dim(`(output: ${stdout.trim()})`)}`);
        } else {
          spinner.fail(`${chalk.bold(version.version)} failed ${chalk.dim(`(output: ${stdout.trim()})`)}`);
        }
        resolve(success);
      },
    });
  });
}
