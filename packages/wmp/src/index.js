import createFetchAPI from './createFetchAPI';
import createRouter from './createRouter';
import createUI from './createUI';
import createWmp from './createWmp';
import * as storage from './storage';

export default function(apis, options) {
  return {
    fetchAPI: createFetchAPI(apis, options.fetchAPI),
    ...createRouter(apis, options),
    ...createUI(apis, options),
    ...createWmp(apis, options),
    ...storage,
  };
}
