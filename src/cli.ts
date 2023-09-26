import assert from "node:assert";
import {parseArgs} from "node:util";
import semver from "semver";
import path from "node:path";
import fs from "node:fs";

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
    },
});

interface UserOptions {
    test: string,
    from: string,
    to: string
}

function validateAndParseOptions(args: UserOptions) {
    assert.ok(args.test, "Missing required argument: --test");
    assert.ok(args.from, "Missing required argument: --from");
    assert.ok(args.to, "Missing required argument: --to");
    assert.ok(semver.valid(args.from), `Invalid version: --from ${args.from}`);
    assert.ok(semver.valid(args.to), `Invalid version: --to ${args.to}`);
    assert.ok(
        semver.gt(args.from, args.to),
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
    };
}

export const options = validateAndParseOptions(values as UserOptions);
