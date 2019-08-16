'use strict';

const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const envTarget = process.env.TARGET;

const appPackageJson = resolveApp('package.json');
const appTarget = resolveApp(envTarget || '.');
const appBuild = path.join(appTarget, 'miniprogram_npm');

module.exports = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appPackageJson,
  appNodeModules: resolveApp('node_modules'),
  yarnLockFile: resolveApp('yarn.lock'),
  appSrc: resolveApp('src'),
  appIndexJs: resolveApp('src/index'),
  appTarget,
  appBuild,
  outputJs: path.join(appBuild, require(appPackageJson).name, 'index.js'),
};
