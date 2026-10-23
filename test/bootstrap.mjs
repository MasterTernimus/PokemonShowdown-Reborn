/** Wait for real asynchronous server initialization before Mocha imports plugins. */
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
require('./main.js');
await require('../dist/server').readyPromise;
