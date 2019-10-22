import createRouter from './createRouter';
import Router from './Router';
import storage from './storage';

export default function(apis, options) {
  return {
    ...storage,
    ...createRouter(apis, options),
  };
}

export { Router };
