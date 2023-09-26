export class MissingVersionError extends Error {
  readonly name: 'MissingVersionError';
  version: string;

  constructor(version) {
    super(`Version ${version} not found`);
    this.version = version;
  }
}