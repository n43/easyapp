import { splitCookiesString, parseCookie } from './cookie';

export default function(apis, options) {
  const { stringifyLocation } = apis;
  const { origin = '', parseData } = options;

  return function fetchAPI(options = {}) {
    const { method, data } = options;
    let url = options.url || '';
    const init = {
      headers: { Accept: 'application/json', Cookie: getCookies() },
      dataType: 'json',
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

    init.url = url;

    return new Promise((resolve, reject) => {
      wx.request({
        ...init,
        success: res => resolve(res),
        fail: res => reject(new Error(res.errMsg)),
      });
    }).then(res => {
      const { statusCode, data, header } = res;

      if (statusCode < 200 || statusCode >= 300) {
        throw new Error('网络请求失败');
      }

      let cookies = header['Set-Cookie'];

      if (cookies) {
        setCookies(cookies);
      }

      return parseData ? parseData(data) : data;
    });
  };
}

let cookiesStorage = null;

function getCookies() {
  if (!cookiesStorage) {
    cookiesStorage = wx.getStorageSync('COOKIES') || {};
  }

  const cookies = [];

  for (let ckey in cookiesStorage) {
    let cookie = cookiesStorage[ckey];

    if (cookie.expires) {
      let expiresDate = cookie.expires;

      if (Object.prototype.toString.call(expiresDate) !== '[object Date]') {
        expiresDate = new Date(expiresDate);
      }

      if (expiresDate.getTime() < new Date().getTime()) {
        continue;
      }
    }

    cookies.push((cookie.name || cookie.key) + '=' + cookie.value);
  }

  return cookies.join('; ');
}

function setCookies(cookies) {
  cookiesStorage = splitCookiesString(cookies).reduce(
    (storage, str) => {
      const cookie = parseCookie(str);

      storage[cookie.name] = cookie;
      return storage;
    },
    { ...cookiesStorage }
  );

  wx.setStorage({
    key: 'COOKIES',
    data: cookiesStorage,
  });
}
