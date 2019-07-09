const defaultFetchTicket = () => {
  throw new Error('初始化微信SDK，需要实现 options.fetchTicket 方法');
};
const defaultFetchPayCode = () => {
  throw new Error('微信支付，需要实现 options.fetchPayCode 方法');
};
const defaultGetAuthURL = () => {
  throw new Error('微信认证，需要实现 options.getAuthURL 方法');
};

export default function(apis = {}, options = {}) {
  const { stringifyLocation, parseLocation } = apis;
  const {
    fetchTicket = defaultFetchTicket,
    fetchPayCode = defaultFetchPayCode,
    getAuthURL = defaultGetAuthURL,
    jsApiList = [],
    hiddenMenuList,
  } = options;

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
        wx.config({ ...ticket, jsApiList: jsApiList.concat() });
      });
    })
    .then(wechat => {
      wechat.auth = () => {
        const loc = parseLocation(window.location.href);
        const ua = window.navigator.userAgent;

        if (/android/i.test(ua)) {
          loc.searchData.t = new Date().getTime();
        }

        window.location.replace(
          stringifyLocation({
            pathname: 'https://open.weixin.qq.com/connect/oauth2/authorize',
            searchData: {
              appid: wechat.appId,
              redirect_uri: getAuthURL(stringifyLocation(loc)),
              response_type: 'code',
              scope: 'snsapi_userinfo',
            },
            hash: '#wechat_redirect',
          })
        );
      };

      wechat.onShare = shareDict => {
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
          const loc = parseLocation(window.location.href);

          loc.searchData.t = new Date().getTime();
          loc.hash = '#' + shareDict.path;

          params.link = stringifyLocation(loc);
        }

        jsApiList.forEach(api => {
          if (api.indexOf('onMenuShare') === 0) {
            wechat.wx[api](params);
          }
        });
      };

      wechat.pay = scene => {
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
      };

      return { wechat };
    });
}
