import QueryString from 'query-string';

function defaultFetchTicket() {
  throw new Error('初始化微信SDK，需要实现 options.fetchTicket 方法');
}
function defaultFetchPayCode() {
  throw new Error('微信支付，需要实现 options.fetchPayCode 方法');
}
function defaultGetAuthURL() {
  throw new Error('微信认证，需要实现 options.getAuthURL 方法');
}

export default function(apis = {}, options = {}) {
  const {
    fetchTicket = defaultFetchTicket,
    fetchPayCode = defaultFetchPayCode,
    getAuthURL = defaultGetAuthURL,
    jsApiList = [],
    hiddenMenuList,
  } = options;

  const url = window.location.href.split('#')[0];

  function createWechat(wechat) {
    function auth() {
      const ua = window.navigator.userAgent;
      const loc = window.location;
      const searchData = QueryString.parse(loc.search);

      if (/android/i.test(ua)) {
        searchData.t = new Date().getTime();
      }

      const url =
        loc.origin +
        loc.pathname +
        '?' +
        QueryString.stringify(searchData) +
        loc.hash;

      loc.replace(
        'https://open.weixin.qq.com/connect/oauth2/authorize?' +
          QueryString.stringify({
            appid: wechat.appId,
            redirect_uri: getAuthURL(url),
            response_type: 'code',
            scope: 'snsapi_userinfo',
          }) +
          '#wechat_redirect'
      );
    }

    function onShare(shareDict) {
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
        const loc = window.location;
        const searchData = QueryString.parse(loc.search);

        searchData.t = new Date().getTime();

        params.link =
          loc.origin +
          loc.pathname +
          '?' +
          QueryString.stringify(searchData) +
          '#' +
          shareDict.path;
      }

      jsApiList.forEach(api => {
        if (api.indexOf('onMenuShare') === 0) {
          wechat.wx[api](params);
        }
      });
    }

    function pay(scene) {
      if (jsApiList.indexOf('chooseWXPay') === -1) {
        throw new Error('需要在 options.jsApiList 中添加 chooseWXPay');
      }

      return Promise.resolve(fetchPayCode(scene)).then(
        params =>
          new Promise((resolve, reject) => {
            window.WeixinJSBridge.invoke(
              'getBrandWCPayRequest',
              params,
              res => {
                const errMsg = res.errMsg || res.err_msg;
                const type = errMsg.substring(errMsg.indexOf(':') + 1);

                if (type === 'ok') {
                  resolve();
                  return;
                }
                if (type === 'cancel') {
                  reject(new Error('微信支付已取消'));
                  return;
                }
                reject(new Error('微信支付失败'));
              }
            );
          })
      );
    }

    wechat.auth = auth;
    wechat.onShare = onShare;
    wechat.pay = pay;

    return { wechat };
  }

  return Promise.all([
    Promise.resolve(fetchTicket(url)),
    import('../WechatSDK'),
  ])
    .then(([ticket]) => {
      const wx = window.wx;

      return new Promise((resolve, reject) => {
        wx.error(res => reject(new Error(res.errMsg)));
        wx.ready(() => resolve({ wx, appId: ticket.appId }));
        wx.config({ ...ticket, jsApiList: jsApiList.concat() });
      });
    })
    .then(createWechat);
}
