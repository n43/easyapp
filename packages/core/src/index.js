import QueryString from 'query-string';
import createFetchAPI from './createFetchAPI';
import createStore from './createStore';
import * as storage from './storage';

export default function(options = {}) {
  const store = createStore(options.store);
  const fetchAPI = createFetchAPI(options.fetchAPI);

  return { QueryString, store, dispatch: store.dispatch, fetchAPI, ...storage };
}
