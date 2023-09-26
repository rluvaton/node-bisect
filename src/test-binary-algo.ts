import {afterEach, describe, it} from 'node:test';
import assert from 'node:assert';
import {bisect} from "./binary-search";
import semver from "semver";

describe('test binary algo', () => {

    afterEach(() => {
        console.log('\n\n\n');
    });

    // it('all good should return null', async () => {
    //     const res = await bisect(generateArray(5), async () => true, (v) => v.val);
    //
    //     assert.strictEqual(res, null);
    // });
    //
    // it('all bad should return null', async () => {
    //     const res = await bisect(generateArray(5), async () => false, (v) => v.val);
    //
    //     assert.strictEqual(res, null);
    // });
    //
    // it('should find the bad item when its the last', async () => {
    //     // the bad commit here is 0
    //     // 0: good
    //     // ...: good
    //     // 6: good
    //     // 7: bad - introduce a bug
    //     // 8: bad - still bug
    //     // ...: bad - still bug
    //     // 99: bad - still bug
    //     const arr = generateArray(100);
    //     const res = await bisect(arr, async ({val}) => {
    //         // everything before last item is good
    //         return val < arr[arr.length - 1].val;
    //     }, (v) => v.val);
    //
    //     assert.deepStrictEqual(res, {
    //         val: arr[arr.length - 1].val
    //     });
    // });


    describe('real data', () => {
        it('should find the bad item when in the middle left', async () => {
            const res = await bisect(getRealArray(), async ({version}) => {
                // everything before v19.8.1 is good
               const a = semver.lt(version, 'v19.8.1');

                console.log(`testing ${version} - ${a}`);
                return a;
            }, (v) => v.version);

            assert.deepStrictEqual(res, {
                version: 'v19.8.1'
            });
        });
        //
        // it('should find the bad item when in the middle right', async () => {
        //     // the bad commit here is 63
        //     // 0: good
        //     // ...: good
        //     // 62: good
        //     // 63: bad - introduce a bug
        //     // 64: bad - still bug
        //     // ...: bad - still bug
        //     // 99: bad - still bug
        //     const res = await bisect(generateArray(100), async ({val}) => {
        //         // everything before 63 is good
        //         return val < 63;
        //     }, (v) => v.val);
        //
        //     assert.deepStrictEqual(res, {
        //         val: 63
        //     });
        // });

    });

    function generateArray(size: number) {
        return Array.from({length: size}, (_, i) => ({
            val: i + 1
        }));
    }

    function getRealArray() {
        return [
            {
                "version": "v18.17.0"
            },
            {
                "version": "v18.17.1"
            },
            {
                "version": "v18.18.0"
            },
            {
                "version": "v19.0.0"
            },
            {
                "version": "v19.0.1"
            },
            {
                "version": "v19.1.0"
            },
            {
                "version": "v19.2.0"
            },
            {
                "version": "v19.3.0"
            },
            {
                "version": "v19.4.0"
            },
            {
                "version": "v19.5.0"
            },
            {
                "version": "v19.6.0"
            },
            {
                "version": "v19.6.1"
            },
            {
                "version": "v19.7.0"
            },
            {
                "version": "v19.8.0"
            },
            {
                "version": "v19.8.1"
            },
            {
                "version": "v19.9.0"
            },
            {
                "version": "v20.0.0"
            },
            {
                "version": "v20.1.0"
            },
            {
                "version": "v20.2.0"
            },
            {
                "version": "v20.3.0"
            },
            {
                "version": "v20.3.1"
            },
            {
                "version": "v20.4.0"
            },
            {
                "version": "v20.5.0"
            }
        ]
    }

});
