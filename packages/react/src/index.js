import createRouter from './createRouter';

export default function(apis, options) {
  return { ...createRouter(apis, options) };
}
