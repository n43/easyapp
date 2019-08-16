'use strict';

const path = require('path');
const fs = require('fs-extra');
const paths = require('../config/paths');

module.exports = function() {
  fs.readdirSync(paths.appNodeModules).forEach(name => {
    const dist = path.join(paths.appNodeModules, name, 'miniprogram_dist');

    if (fs.existsSync(dist)) {
      const dest = path.join(paths.appBuild, name);

      fs.copySync(dist, dest, { dereference: true });
    }
  });
};
