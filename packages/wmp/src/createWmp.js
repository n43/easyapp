function defaultFetchPayCode() {
  throw new Error('微信支付，需要实现 options.fetchPayCode 方法');
}
function defaultAuthWithCode() {
  throw new Error('微信认证，需要实现 options.authWithCode 方法');
}

export default function(apis, options) {
  const {
    fetchPayCode = defaultFetchPayCode,
    authWithCode = defaultAuthWithCode,
  } = options;

  function auth() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => resolve(res),
        fail: res => reject(new Error(res.errMsg)),
      });
    }).then(({ code }) => authWithCode(code));
  }

  function pay(scene) {
    return Promise.resolve(fetchPayCode(scene)).then(
      params =>
        new Promise((resolve, reject) => {
          wx.requestPayment({
            ...params,
            complete: res => {
              const errMsg = res.errMsg;
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
            },
          });
        })
    );
  }

  return { wmp: { auth, pay } };
}
