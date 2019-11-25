module.exports = {
  presets: [['@babel/env', { loose: true, modules: false }]],
  plugins: [
    ['@babel/plugin-proposal-object-rest-spread', { loose: true }],
    ['@babel/plugin-transform-runtime', { useESModules: false }],
  ],
};
