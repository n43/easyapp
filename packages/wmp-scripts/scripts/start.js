'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const chalk = require('react-dev-utils/chalk');
const rollup = require('rollup');
const configFactory = require('../config/rollup.config');
const printBuildError = require('react-dev-utils/printBuildError');
const clearBuildDir = require('../utils/clearBuildDir');
const copyVendorsToBuildDir = require('../utils/copyVendorsToBuildDir');

// Generate configuration
const config = configFactory('development');

Promise.resolve()
  .then(() => {
    clearBuildDir();
    copyVendorsToBuildDir();

    return watch();
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });

function watch() {
  const watcher = rollup.watch(config);

  watcher.on('event', async event => {
    switch (event.code) {
      case 'BUNDLE_START':
        console.log('Creating a development build...');
        break;
      case 'BUNDLE_END':
        console.log(chalk.green('Compiled successfully.\n'));
        break;
      case 'ERROR':
      case 'FATAL':
        console.log(chalk.red('Failed to compile.\n'));
        printBuildError(event.error);
        break;
    }
  });
}
