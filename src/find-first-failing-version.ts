import {testVersion, testVersionDocker} from "./test-file";
import {NodeVersion} from "./node-versions";
import {bisect} from "./binary-search";
import ora from "ora";
import chalk from "chalk";

export async function findFirstFailingVersion(versions: NodeVersion[], testFile: string) {
    return await bisect(versions, async (version) => {
        const spinner = ora(`Testing version ${chalk.bold(version.version)}`).start();

        let success: boolean;
        try {
            success = await testVersionDocker({version : version, testFile : testFile, spinner});
            // success = await testVersion({version : version, testFile : testFile, spinner});
        } catch (err) {
            spinner.fail(`Failed to test ${version.version}`);
            throw err;
        }

        return success;
    }, (version) => version.version);
}
