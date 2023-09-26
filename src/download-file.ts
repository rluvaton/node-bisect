import os from 'node:os';
import fs from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';
import { extract } from 'tar-fs';
import gunzip from 'gunzip-maybe';

let tmpFolder: string;

export async function downloadFile({ version, url }: { version: string, url: string }) {
  if (!url.endsWith('tar.gz')) {
    throw new Error('Only tar.gz files are supported (we do not know how to run the tests for other file types)');
  }

  if (!tmpFolder) {
    tmpFolder = await fs.mkdtemp(path.join(os.tmpdir(), 'node-versions-'));
    console.log(`Created temporary folder ${tmpFolder}`);
  }

  const baseDownloadOutputFolder = path.join(tmpFolder, version);

  await fs.mkdir(baseDownloadOutputFolder);

  const outputFolder = path.join(baseDownloadOutputFolder, version);

  console.log(`Downloading ${url} to ${outputFolder}`);

  const downloadFileRes = await fetch(url);

  await pipeline(Readable.fromWeb(downloadFileRes.body as any), gunzip(), extract(outputFolder));

  console.log(`Downloaded ${url} to ${outputFolder}`);

  return {
    async cleanup() {
      await fs.rm(outputFolder, { recursive: true, force: true });
    },
    folderPath: outputFolder
  };
}

export async function cleanupTmpFolder() {
  if(!tmpFolder) {
    return;
  }
  await fs.rm(tmpFolder, { recursive: true, force: true });
}
