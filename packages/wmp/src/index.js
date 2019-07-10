import createFetchAPI from './createFetchAPI';
import createRouter from './createRouter';
import createUI from './createUI';
import createWmp from './createWmp';
import * as storage from './storage';

export default function(apis, options) {
  return {
    ...createFetchAPI(apis, options),
    ...createRouter(apis, options),
    ...createUI(apis, options),
    ...createWmp(apis, options),
    ...storage,
  };
}
