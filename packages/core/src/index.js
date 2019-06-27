import createFetchAPI from './createFetchAPI';
import createStore from './createStore';

export function init(options) {
  return {
    store: createStore(options.store),
    fetchAPI: createFetchAPI(options.fetchAPI),
  };
}
