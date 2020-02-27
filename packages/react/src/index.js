import createRouter from './createRouter';
import Page from './Page';

export default function(apis, options) {
  return { ...createRouter(apis, options) };
}

export { Page };
