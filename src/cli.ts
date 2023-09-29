import assert from "node:assert";
import {parseArgs} from "node:util";
import semver from "semver";
import path from "node:path";
import fs from "node:fs";

// For macOS, default to 'dist' as we currently only support dist in docker
const isDistSupported = process.platform === 'darwin';

const {values} = parseArgs({
    options: {
        // Define the test file and its command to run
        test: {
            type: "string",
        },

        // Define the Node.js version range to search

        // Lower bound of the Node.js version range
        from: {
            type: "string",
        },

        // Upper bound of the Node.js version range
        to: {
            type: "string",
        },

        // from where to run the tests, either 'dist' or 'docker'
        source: {
            type: "string",

            default: isDistSupported ? 'dist' : 'docker'
        },

        help: {
            type: "boolean",

            short: "h",
            default: false,
        }
    },
});

interface UserOptions {
    test: string,

    from: string,
    to: string,

    source: 'docker' | 'dist'
}

function validateAndParseOptions(args: UserOptions) {
    assert.ok(args.test, "Missing required argument: --test");
    assert.ok(args.from, "Missing required argument: --from");
    assert.ok(args.to, "Missing required argument: --to");
    assert.ok(semver.valid(args.from), `Invalid version: --from ${args.from}`);
    assert.ok(semver.valid(args.to), `Invalid version: --to ${args.to}`);

    const availableSources = ['docker'];

    if(isDistSupported) {
        availableSources.push('dist');
    }

    assert.ok(availableSources.includes(args.source), `Invalid value for --source: ${args.source}, must be one of ${availableSources.join(', ')}`);

    assert.ok(
        semver.lt(args.from, args.to),
        "--from cannot be greater than --to"
    );

    const testFilePath = path.isAbsolute(args.test)
        ? args.test
        : path.join(process.cwd(), args.test);

    // assert file exists
    assert.ok(
        fs.existsSync(testFilePath),
        `Test file does not exist:${args.test} (full path: ${testFilePath})`
    );

    return {
        testFile: testFilePath,
        from: args.from,
        to: args.to,
        source: args.source
    };
}

const helpText = `
node-bisect - A CLI tool to run tests on different Node.js versions within a specified version range to
find the version that introduced a bug. 

Usage:
  node-bisect [options]

Options:
  --test <path>          Specify the path to the test file (should exit with 0 for success or other for failure).
  --from <version>       Define the lower bound of the Node.js version range.
  --to <version>         Define the upper bound of the Node.js version range.
${isDistSupported ? `
  --source <source>      Specify where to download the node version in 'docker' or 'dist'. (default: 'dist') [optional]
`.substring(1) /*remove first extra line */: `
  --source <source>      Specify where to download the node version currently only docker is supported in your system [optional]
`.substring(1) /*remove first extra line */
}
  -h, --help             Display this help message.

Examples:
  - Run tests on Node.js versions from 18.0.0 to 20.0.0:
    $ node-bisect --test my-test.js --from 18.0.0 --to 20.0.0
`

if(values.help) {
    console.log(helpText);
    process.exit(0);
}

export const options = validateAndParseOptions(values as UserOptions);
