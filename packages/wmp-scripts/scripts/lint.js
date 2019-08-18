'use strict';

const chalk = require('react-dev-utils/chalk');
const eslint = require('eslint');
const paths = require('../config/paths');
const eslintConfig = require('../config/eslint.config');

console.log('Linting all files...');

if (runESLint()) {
  console.log(chalk.green('Lint passed.\n'));
} else {
  console.log(chalk.red('Lint failed.\n'));
  process.exit(1);
}

function runESLint() {
  const cli = new eslint.CLIEngine(eslintConfig);
  const formatter = cli.getFormatter();
  const report = cli.executeOnFiles([paths.appSrc]);

  console.log(formatter(report.results));

  return report.errorCount === 0 && report.warningCount === 0;
}
