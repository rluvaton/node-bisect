#!/usr/bin/env node
import { options } from './cli.js';
import { getNodeVersionsInRange } from './node-versions.js';
import { cleanupTmpFolder } from './download-file.js';
import ora from 'ora';
import { bisect } from './binary-search.js';
import chalk from 'chalk';
import { testVersionDist, testVersionDocker } from './test-file.js';

async function run() {
  const spinner = ora(`Downloading versions between ${options.from} to ${options.to}`).start();
  const versions = await getNodeVersionsInRange(options.from, options.to);
  spinner.succeed(`Downloaded ${versions.length} versions (${versions.map((v) => v.version).join(', ')})`);

  const failedRelease = await bisect(versions, async (version) => {
    const spinner = ora(`Testing version ${chalk.bold(version.version)}`).start();

    let success: boolean;
    try {
      if (options.source === 'docker') {
        success = await testVersionDocker({ version: version, testFile: options.testFile, spinner });
      } else {
        success = await testVersionDist({ version: version, testFile: options.testFile, spinner });
      }
    } catch (err) {
      spinner.fail(`Failed to test ${version.version}`);
      throw err;
    }

    return success;
  });

  if (!failedRelease) {
    console.log(`No failing release found in ${options.from} to ${options.to}`);
    return 1;
  }

  console.log(`The first release that failed was ${failedRelease.version}`);
  console.log(`Go to the following link to see the changes in this release:`);
  console.log(`\thttps://github.com/nodejs/node/releases/tag/${failedRelease.version}`);
}

let exitCode = 0;

run()
  .then(
    (code) => {
      if (code) {
        exitCode = code;
      }
    },
    (err) => {
      console.error('failed', err);
      exitCode = 1;
    },
  )
  .finally(async () => {
    await cleanupTmpFolder();

    if (exitCode) {
      process.exit(exitCode);
    }
  });
