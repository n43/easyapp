const defaultFetchTicket = () => {
  throw new Error('需要实现 options.fetchTicket 方法');
};
const defaultFetchPayCode = () => {
  throw new Error('需要实现 options.fetchPayCode 方法');
};

export default function(apis = {}, options = {}) {
  const { fetchTicket = defaultFetchTicket, jsApiList } = options;

  const url = window.location.href.split('#')[0];

  return Promise.all([
    Promise.resolve().then(() => fetchTicket(url)),
    import('../WechatSDK'),
  ])
    .then(([ticket]) => {
      const wx = window.wx;

      return new Promise((resolve, reject) => {
        wx.error(res => reject(new Error(res.errMsg)));
        wx.ready(() => resolve({ wx, appId: ticket.appId }));
        wx.config({ ...ticket, jsApiList });
      });
    })
    .then(wechat => {
      wechat.auth = createAuth(wechat, apis, options);
      wechat.onShare = createOnShare(wechat, apis, options);
      wechat.pay = createPay(wechat, apis, options);

      return { wechat };
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

function createOnShare(wechat, apis, options = {}) {
  return function(shareDict) {
    const { QueryString } = apis;
    const { jsApiList = [], hiddenMenuList } = options;
    let menuList = [];

    if (hiddenMenuList) {
      menuList = menuList.concat(hiddenMenuList);
    }
    if (!shareDict) {
      menuList = menuList.concat([
        'menuItem:share:appMessage',
        'menuItem:share:timeline',
        'menuItem:share:qq',
        'menuItem:share:weiboApp',
        'menuItem:favorite',
        'menuItem:share:facebook',
        'menuItem:share:QZone',
      ]);
    }

    if (menuList.length > 0) {
      if (jsApiList.indexOf('hideMenuItems') === '-1') {
        throw new Error('需要在 options.jsApiList 中添加 hideMenuItems');
      }

      wechat.wx.hideMenuItems({ menuList });
    }

    if (!shareDict) {
      return;
    }

    const params = {
      title: shareDict.title,
      desc: shareDict.desc,
      imgUrl: shareDict.imgUrl,
      link: shareDict.link,
    };

    if (shareDict.path) {
      const [urlOrigin, urlSearch] = window.location.href
        .split('#')[0]
        .split('?');
      const query = QueryString.parse(urlSearch);

      query.t = new Date().getTime();
      params.link =
        urlOrigin + '?' + QueryString.stringify(query) + '#' + shareDict.path;
    }

    jsApiList.forEach(api => {
      if (api.indexOf('onMenuShare') === 0) {
        wechat.wx[api](params);
      }
    });
  };
}

function createPay(wechat, apis, options = {}) {
  return function(scene) {
    const { jsApiList, fetchPayCode = defaultFetchPayCode } = options;

    if (jsApiList.indexOf('chooseWXPay') === -1) {
      throw new Error('需要在 options.jsApiList 中添加 chooseWXPay');
    }

    return Promise.resolve()
      .then(() => fetchPayCode(scene))
      .then(
        payCode =>
          new Promise((resolve, reject) => {
            window.WeixinJSBridge.invoke(
              'getBrandWCPayRequest',
              payCode,
              res => {
                if (res.err_msg.indexOf('get_brand_wcpay_request:fail') === 0) {
                  reject(new Error('微信支付失败'));
                  return;
                }
                if (
                  res.err_msg.indexOf('get_brand_wcpay_request:cancel') === 0
                ) {
                  reject(new Error('微信支付已取消'));
                  return;
                }

                resolve();
              }
            );
          })
      );
  };
}
