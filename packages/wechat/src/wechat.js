const defaultFetchTicket = () => {
  throw new Error('必需实现options.wechat.fetchTicket方法');
};

export default function(apis = {}, options = {}) {
  const { fetchTicket = defaultFetchTicket } = options;

  const url = window.location.href.split('#')[0];

  return Promise.all([fetchTicket(url), import('./WechatSDK')]).then(
    ([ticket]) => {
      apis.wechat = { wx: window.wx, ...ticket };

      return apis;
    }
  );
}
