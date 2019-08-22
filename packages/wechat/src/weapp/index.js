import QueryString from 'query-string';
import createRouter from './createRouter';

function defaultFetchTicket() {
  throw new Error('初始化微信SDK，需要实现 options.fetchTicket 方法');
}
function defaultGetAuthURL() {
  throw new Error('微信认证，需要实现 options.getAuthURL 方法');
}

export default function(apis = {}, options = {}) {
  const { dispatch } = apis;
  const {
    fetchTicket = defaultFetchTicket,
    getAuthURL = defaultGetAuthURL,
    convertToWeappPage,
  } = options;

  function createWeapp(weapp) {
    const WMP = weapp.wx.miniProgram;

    function weappDispatch(action) {
      WMP.postMessage({
        data: { type: 'ON_DISPATCH_ACTION', params: action },
      });

      return dispatch(action);
    }

    function auth(params) {
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
            appid: weapp.appId,
            redirect_uri: getAuthURL(url, params),
            response_type: 'code',
            scope: 'snsapi_userinfo',
          }) +
          '#wechat_redirect'
      );
    }

    function onShare(shareDict) {
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

      WMP.postMessage({
        data: { type: 'ON_MENU_SHARE', params },
      });
    }

    weapp.auth = auth;
    weapp.onShare = onShare;

    return {
      weapp,
      dispatch: weappDispatch,
      ...createRouter(weapp, apis, options),
    };
  }

  const url = window.location.href.split('#')[0];

  return Promise.all([fetchTicket(url), import('../WechatSDK')])
    .then(([ticket]) => ({ wx: window.wx, appId: ticket.appId }))
    .then(createWeapp);
}
