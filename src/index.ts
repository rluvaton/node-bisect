import fs from 'node:fs';
import path from "node:path";
import {exec} from "node:child_process";
import semver from 'semver';
import {options} from './cli.js'

// Main function to find the failing version using binary search
async function findFailingVersion(start, end) {
  if (start === end) {
    console.log(`The failing version is: ${start}`);
    return;
  }

  const midVersion = findMidVersion(start, end);
  console.log(`Testing version ${midVersion}...`);

  // Check if the test fails for the midVersion
  const testResult = await runTest(midVersion);

  if (testResult === 'fail') {
    findFailingVersion(start, midVersion);
  } else {
    findFailingVersion(midVersion, end);
  }
}

// Function to find the mid-version between two versions
function findMidVersion(start, end) {
  const startMajor = parseInt(start.slice(1).split('.')[0]);
  const endMajor = parseInt(end.slice(1).split('.')[0]);
  const midMajor = Math.floor((startMajor + endMajor) / 2);

  return `v${midMajor}.0.0`;
}

// Function to run the test with a specific Node.js version
async function runTest(nodeVersion) {
  const nodePath = await downloadNodeVersion(nodeVersion);

  const command = `${nodePath} ${testFile}`;
  
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // Test failed
        console.error(`Test failed for version ${nodeVersion}`);
        resolve('fail');
      } else {
        // Test passed
        console.log(`Test passed for version ${nodeVersion}`);
        resolve('pass');
      }
    });
  });
}

// // Fetch the list of available Node.js versions and start the binary search
// fetch(nodeVersionsUrl)
//   .then((response) => {
//     const nodeVersions = response.data.map((version) => version.version);
//     const filteredVersions = nodeVersions.filter((version) =>
//       version >= startVersion && version < endVersion
//     );

//     // Ensure the test file exists
//     if (!fs.existsSync(testFile)) {
//       console.error(`Test file "${testFile}" does not exist.`);
//       process.exit(1);
//     }

//     findFailingVersion(filteredVersions[0], filteredVersions[filteredVersions.length - 1]);
//   })
//   .catch((error) => {
//     console.error('Error fetching Node.js versions:', error);
//   });
