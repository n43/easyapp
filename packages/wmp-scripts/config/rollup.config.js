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
      eslint({ ...eslintConfig, throwOnError: true }),
      babel({
        babelrc: false,
        exclude: '**/node_modules/**',
        presets: [['@babel/env', { loose: true, modules: false }]],
        plugins: [
          ['@babel/plugin-proposal-object-rest-spread', { loose: true }],
          ['@babel/plugin-transform-runtime', { useESModules: false }],
        ],
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
