import QueryString from 'query-string';

export default function(options = {}) {
  const { parseData } = options;

  return function fetchAPI(options = {}) {
    const { method, data } = options;
    let url = options.url || '';
    const init = {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    };

    init.method = (method && method.toUpperCase()) || 'GET';

    if (init.method === 'GET') {
      if (data) {
        url += '?' + QueryString.stringify(data);
      }
    } else {
      init.headers['Content-Type'] = 'application/json';

      if (data) {
        init.body = JSON.stringify(data);
      }
    }

    return fetch(url, init).then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      let data = response.json();

      if (parseData) {
        data = parseData(data);
      }

      return data;
    });
  };
}
