export default function(apis, options) {
  function showTips(tipsType, message) {
    return new Promise((resolve, reject) => {
      wx.showToast({
        icon: tipsType === 'succ' ? 'success' : 'none',
        title: message || '未知错误',
        success: () => resolve(),
        fail: res => reject(new Error(res.errMsg)),
      });
    });
  }

  function showConfirm(options) {
    const {
      title = '',
      message = '',
      cancelTitle = '取消',
      doneTitle = '确定',
      primary = 'done',
      cancelable = true,
    } = options;
    let cancelText;
    let confirmText;

    if (cancelable) {
      if (primary === 'cancel') {
        cancelText = doneTitle;
        confirmText = cancelTitle;
      } else {
        cancelText = cancelTitle;
        confirmText = doneTitle;
      }
    } else {
      cancelText = cancelTitle;
      confirmText = doneTitle;
    }

    return new Promise((resolve, reject) => {
      wx.showModal({
        title,
        content: message,
        cancelText,
        confirmText,
        cancelColor: '#696969',
        confirmColor: '#b59f76',
        showCancel: cancelable,
        success: res => {
          const data = {};

          if (primary === 'cancel') {
            data.done = res.cancel;
            data.cancel = res.confirm;
          } else {
            data.done = res.confirm;
            data.cancel = res.cancel;
          }

          resolve(data);
        },
        fail: res => reject(new Error(res.errMsg)),
      });
    });
  }

  return { showTips, showConfirm };
}
