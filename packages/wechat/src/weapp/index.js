import createRouter from './router';

const defaultFetchTicket = () => {
  throw new Error('初始化微信SDK，需要实现 options.fetchTicket 方法');
};
const defaultGetAuthURL = () => {
  throw new Error('微信认证，需要实现 options.getAuthURL 方法');
};

export default function(apis = {}, options = {}) {
  const { stringifyLocation, parseLocation, dispatch } = apis;
  const {
    fetchTicket = defaultFetchTicket,
    getAuthURL = defaultGetAuthURL,
    convertToWeappPage,
  } = options;

  const url = window.location.href.split('#')[0];

  return Promise.all([fetchTicket(url), import('../WechatSDK')])
    .then(([ticket]) => ({ wx: window.wx, appId: ticket.appId }))
    .then(weapp => {
      const nextAPIs = {
        weapp,
        dispatch: action => {
          weapp.wx.postMessage({
            data: { type: 'ON_DISPATCH_ACTION', params: action },
          });

          return dispatch(action);
        },
        ...createRouter(weapp, apis, options),
      };

      weapp.auth = () => {
        const ua = window.navigator.userAgent;
        const loc = parseLocation(window.location.href);

        if (/android/i.test(ua)) {
          loc.searchData.t = new Date().getTime();
        }

        window.location.replace(
          stringifyLocation({
            pathname: 'https://open.weixin.qq.com/connect/oauth2/authorize',
            searchData: {
              appid: weapp.appId,
              redirect_uri: getAuthURL(stringifyLocation(loc)),
              response_type: 'code',
              scope: 'snsapi_userinfo',
            },
            hash: '#wechat_redirect',
          })
        );
      };

      weapp.onShare = shareDict => {
        let params = null;

        if (shareDict && shareDict.path && convertToWeappPage) {
          let path = convertToWeappPage(shareDict.path);

          if (path && typeof path !== 'string') {
            path = path[0];
          }

          params = {
            title: shareDict.title,
            imageUrl: shareDict.imageUrl,
            path,
          };
        }

        weapp.wx.postMessage({ data: { type: 'ON_MENU_SHARE', params } });
      };

      return nextAPIs;
    });
}
