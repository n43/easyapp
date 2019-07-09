export default function(apis = {}, options) {
  const { stringifyLocation } = apis;

  function createPath(page) {
    const route = (page && page.route) || '';
    const options = (page && page.options) || {};
    let pathname = '/' + route;
    let search = Object.keys(options)
      .map(key => key + '=' + options[key])
      .join('&');

    return stringifyLocation({ pathname, search });
  }

  function getTopPage() {
    const pages = getCurrentPages();
    const topPage = pages[pages.length - 1];

    return createPath(topPage);
  }

  function navigateBack() {
    return new Promise((resolve, reject) =>
      wx.navigateBack({
        delta: 1,
        success: () => resolve(),
        fail: res => reject(new Error(res.errMsg)),
      })
    );
  }

  return {
    getTopPage,
    navigateBack,
  };
}
