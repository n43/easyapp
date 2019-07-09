import createRouter from './router';

export default function(apis, options) {
  return { ...createRouter(apis, options) };
}
