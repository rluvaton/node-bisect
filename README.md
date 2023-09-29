# `node-bisect` - Find node release that introduced a regression 

[![npm](https://img.shields.io/npm/v/node-bisect)](https://www.npmjs.com/package/node-bisect)

> Note: if you are on mac you can provide `--source docker` to run the tests in docker container (on other platforms docker is used by default)


Run `npx node-bisect --help` to see all available options

### Example

`test.cjs`:
```javascript
const {Blob} = require('buffer');
const buff = Buffer.allocUnsafe(1024 ** 2);
const source = new Blob(buff);

let start = Date.now();
source.text().finally(() => {
    const took = Date.now() - start;
    process.stdout.write(`finished after ${took}ms`);
    
    // if finish time is greater than 200ms, fail - this will mark the release as bad
    process.exit(took > 200 ? 1 : 0)
});
```

Run this command to find the release that introduced the regression
```bash
npx node-bisect --from 18.17.0 --to 20.5.0 --test ./test.cjs
```
