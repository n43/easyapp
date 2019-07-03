import QueryString from 'query-string';
import createFetchAPI from './createFetchAPI';
import createStore from './createStore';
import * as storage from './storage';

export default function(options = {}) {
  return {
    QueryString,
    store: createStore(options.store),
    fetchAPI: createFetchAPI(options.fetchAPI),
    ...storage,
  };
}
