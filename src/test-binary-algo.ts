import {describe, it} from 'node:test';
import assert from 'node:assert';
import {bisect} from "./binary-search";

describe('test binary algo', () => {
    it('all good should return null', async () => {
        const res = await bisect(generateArray(5), async () => true);

        assert.strictEqual(res, null);
    });

    it('all bad should return null', async () => {
        const res = await bisect(generateArray(5), async () => false);

        assert.strictEqual(res, null);
    });

    it('should find the bad item when its the last', async () => {
        // the bad commit here is 0
        // 0: good
        // ...: good
        // 6: good
        // 7: bad - introduce a bug
        // 8: bad - still bug
        // ...: bad - still bug
        // 99: bad - still bug
        const arr = generateArray(100);
        const res = await bisect(arr, async ({val}) => {
            // everything before last item is good
            return val < arr[arr.length - 1].val;
        });

        assert.deepStrictEqual(res, {
            val: arr[arr.length - 1].val
        });
    });


    describe('real data', () => {
        it('should find the bad item when in the left', async () => {
            const res = await bisect(generateArray(100), async ({val}) => {
                // everything before 7 is good
                return val < 7
            });

            assert.deepStrictEqual(res, {
                val: 7
            });
        });

        it('should find the bad item when in the right', async () => {
            // the bad commit here is 63
            // 0: good
            // ...: good
            // 62: good
            // 63: bad - introduce a bug
            // 64: bad - still bug
            // ...: bad - still bug
            // 99: bad - still bug
            const res = await bisect(generateArray(100), async ({val}) => {
                // everything before 63 is good
                return val < 63;
            });

            assert.deepStrictEqual(res, {
                val: 63
            });
        });

    });

    function generateArray(size: number) {
        return Array.from({length: size}, (_, i) => ({
            val: i + 1
        }));
    }
});
