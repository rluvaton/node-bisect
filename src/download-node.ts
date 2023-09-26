import assert from 'node:assert';
import {NodeVersion} from './node-versions.js';
import {downloadFile} from './download-file.js';
import path from 'node:path';

const distUrl = "https://nodejs.org/dist";

export async function downloadNodeVersion(version: NodeVersion) {
  assert.ok(version, `Version is missing`);
  const folder = getFile(version);

  const downloadPath = `${distUrl}/${version.version}/${folder}`;

  console.log(`Downloading Node.js from ${downloadPath}`);

  const { folderPath, cleanup} = await downloadFile({ version: version.version, url: downloadPath });

  return {
    nodePath: path.join(folderPath, 'bin', 'node'),
    cleanup
  };
}

function getFile(version: NodeVersion) {
  const { platform } = process;

  if(platform === 'darwin') {
    return getFolderForMac(version);
  }

  throw new Error(`Unsupported platform: ${platform}`);
}

function getFolderForMac(version: NodeVersion) {
  const { arch } = process;

  const { files } = version;

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
