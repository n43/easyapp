module.exports = {
  baseConfig: {
    extends: 'react-app',
    settings: { react: { version: '999.999.999' } },
    globals: {
      wx: true,
      getCurrentPages: true,
      getApp: true,
      App: true,
      Page: true,
      Component: true,
      Behavior: true,
    },
  },
};
