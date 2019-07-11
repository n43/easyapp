export function getStorage(key) {
  return new Promise(resolve => {
    wx.getStorage({
      key,
      complete: res => resolve(res.data),
    });
  });
}

export function setStorage(key, value) {
  return new Promise(resolve => {
    if (value === undefined) {
      wx.removeStorage({
        key,
        complete: () => resolve(value),
      });
    } else {
      wx.setStorage({
        key,
        data: value,
        complete: () => resolve(value),
      });
    }
  });
}
