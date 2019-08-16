'use strict';

const fs = require('fs-extra');
const paths = require('../config/paths');

module.exports = function() {
  fs.emptyDirSync(paths.appBuild);
};
