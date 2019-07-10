export function getStorage(key) {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      key,
      success: res => resolve(res.data),
      fail: res => reject(new Error(res.errMsg)),
    });
  });
}

export function setStorage(key, value) {
  return new Promise((resolve, reject) => {
    if (value === undefined) {
      wx.removeStorage({
        key,
        success: () => resolve(value),
        fail: res => reject(new Error(res.errMsg)),
      });
    } else {
      wx.setStorage({
        key,
        data: value,
        success: () => resolve(value),
        fail: res => reject(new Error(res.errMsg)),
      });
    }
  });
}
