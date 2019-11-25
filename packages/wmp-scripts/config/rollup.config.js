'use strict';

const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const babel = require('rollup-plugin-babel');
const { terser } = require('rollup-plugin-terser');
const { eslint } = require('rollup-plugin-eslint');
const paths = require('./paths');
const getClientEnvironment = require('./env');
const eslintConfig = require('./eslint.config');
const babelConfig = require('./babel.config');

module.exports = function(nodeEnv) {
  // const isEnvDevelopment = nodeEnv === 'development';
  // const isEnvProduction = nodeEnv === 'production';
  const env = getClientEnvironment();

  return {
    input: paths.appIndexJs,
    output: {
      file: paths.outputJs,
      intro: 'var regeneratorRuntime;',
      format: 'cjs',
    },
    plugins: [
      nodeResolve(),
      eslint({
        ...eslintConfig,
        useEslintrc: false,
        throwOnError: true,
      }),
      babel({
        ...babelConfig,
        babelrc: false,
        exclude: '**/node_modules/**',
        runtimeHelpers: true,
      }),
      replace(env.stringified),
      commonjs(),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  };
};
