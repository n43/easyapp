const defaultFetchTicket = () => {
  throw new Error('必需实现options.wechat.fetchTicket方法');
};

export default function(apis = {}, options = {}) {
  const { fetchTicket = defaultFetchTicket, config = {} } = options;

  const url = window.location.href.split('#')[0];

  return Promise.all([fetchTicket(url), import('./WechatSDK')])
    .then(([ticket]) => {
      const wx = window.wx;

      return new Promise(resolve => {
        wx.error(res => {
          throw new Error(res.errMsg);
        });
        wx.ready(() => resolve({ wx, appId: ticket.appId }));
        wx.config({ ...ticket, ...config });
      });
    })
    .then(wechat => {
      wechat.auth = createAuth(wechat, apis, options.auth);
      apis.wechat = wechat;

      return apis;
    });
}

function createAuth(wechat, apis, options = {}) {
  return function() {
    const { appId } = wechat;
    const { QueryString } = apis;
    const { getAuthURL } = options;

    const location = window.location;
    const ua = window.navigator.userAgent;
    const loc = {
      href: location.href,
      origin: location.origin,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    };

    if (/android/i.test(ua)) {
      loc.query = QueryString.parse(loc.search);
      loc.query.t = new Date().getTime();
      loc.search = '?' + QueryString.stringify(loc.query);
      loc.href = loc.origin + loc.pathname + loc.search + loc.hash;
    }

    window.location.replace(
      `https://open.weixin.qq.com/connect/oauth2/authorize?${QueryString.stringify(
        {
          appid: appId,
          redirect_uri: getAuthURL(loc),
          response_type: 'code',
          scope: 'snsapi_userinfo',
        }
      )}#wechat_redirect`
    );
  };
}
