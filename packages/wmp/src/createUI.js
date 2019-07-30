export default function(apis, options) {
  const { showConfirm: showConfirmOptions } = options;

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
        ...showConfirmOptions,
        title,
        content: message,
        cancelText,
        confirmText,
        showCancel: cancelable,
        success: res => resolve(res),
        fail: res => reject(new Error(res.errMsg)),
      });
    }).then(res => {
      if (primary === 'cancel') {
        return { done: res.cancel, cancel: res.confirm };
      }

      return { done: res.confirm, cancel: res.cancel };
    });
  }

  return { showTips, showConfirm };
}
