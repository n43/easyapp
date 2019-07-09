import createFetchAPI from './createFetchAPI';
import createStore from './createStore';
import * as storage from './storage';
import * as location from './location';

export default function(options = {}) {
  const store = createStore(options.store);
  const fetchAPI = createFetchAPI(options.fetchAPI);

  return {
    store,
    dispatch: store.dispatch,
    fetchAPI,
    ...storage,
    ...location,
  };
}
