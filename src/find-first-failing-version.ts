import {testVersion} from "./test-file";
import {NodeVersion} from "./node-versions";
import {bisect} from "./binary-search";

export async function findFirstFailingVersion(versions: NodeVersion[], testFile: string) {
    return await bisect(versions, async (version) => {
        const success = await testVersion(version, testFile);
        return !success;
    });
}
