import { stringifyLocation } from './location';

export default function(options = {}) {
  const { origin = '', parseData } = options;

  return function fetchAPI(options = {}) {
    const { method, data } = options;
    let url = options.url || '';
    const init = {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    };

    if (url.indexOf('://') === -1) {
      url = origin + url;
    }

    init.method = (method && method.toUpperCase()) || 'GET';

    if (init.method === 'GET') {
      if (data) {
        url = stringifyLocation({ pathname: url, searchData: data });
      }
    } else {
      init.headers['Content-Type'] = 'application/json';

      if (data) {
        init.body = JSON.stringify(data);
      }
    }

    return fetch(url, init)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }

        return response.json();
      })
      .then(data => {
        return parseData ? parseData(data) : data;
      });
  };
}
