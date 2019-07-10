const defaultFetchPayCode = () => {
  throw new Error('微信支付，需要实现 options.fetchPayCode 方法');
};

export default function(apis, options) {
  const { fetchPayCode = defaultFetchPayCode } = options;

  function pay(scene) {
    return Promise.resolve()
      .then(() => fetchPayCode(scene))
      .then(
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

  return { wmp: { pay } };
}
