/**
 * This file will be auto-discovered by mocha (with `--recursive test/`) and defines
 * hooks to run before/after the entire run.
 *
 * This file depends on test/index.js dependencies attached to global.T via our use of
 * `--require test/index.js` in `npm test`. (Currently it's impossible to define hooks
 * inside the `--require` script because mocha has not intiialized yet, so we're placing
 * the hooks in this separate file.)
 */
/* eslint-disable no-console */

const Logging = require('cccommon/logging').logger('test.global_hooks');

after(async() => {
  const steps = [
    new Promise(resolve => {
      Logging.flushWithCallback(resolve);
    }),

    // Critical operation: if we don't close the connection, the test run will hang but not time out.
    // https://github.com/sequelize/sequelize/issues/8388
    T.models.internaldb.sequelize.close()
  ];
  await Promise.all(steps);
});
