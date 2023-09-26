export class InvalidVersionError extends Error {
  readonly name = 'InvalidVersionError';
  version: string;
  subError?: Error;

  constructor(version: string, subError?: Error) {
    super(`Version ${version} is invalid`);
    this.version = version;
    this.subError = subError;
  }
}
