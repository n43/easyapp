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

  function auth(params) {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => resolve(res),
        fail: res => reject(new Error(res.errMsg)),
      });
    }).then(({ code }) => authWithCode(code, params));
  }

  function pay(params, options) {
    const { subscribeMessage } = options || {};

    return Promise.resolve(fetchPayCode(params)).then(
      params =>
        new Promise((resolve, reject) => {
          wx.requestPayment({
            ...params,
            complete: res => {
              const errMsg = res.errMsg;
              const type = errMsg.substring(errMsg.indexOf(':') + 1);

              if (type === 'ok') {
                if (wx.requestSubscribeMessage && subscribeMessage) {
                  wx.requestSubscribeMessage({
                    ...subscribeMessage,
                    complete: res => {
                      if (subscribeMessage.complete) {
                        subscribeMessage.complete(res);
                      }
                      resolve();
                    },
                  });
                } else {
                  resolve();
                }

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

  return { wmp: { wx, auth, pay } };
}
