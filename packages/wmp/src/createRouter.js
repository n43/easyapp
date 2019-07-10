export default function(apis = {}, options) {
  const { stringifyLocation, parseLocation } = apis;
  const { convertToWmpNavType } = options;

  function createPath(page) {
    const route = (page && page.route) || '';
    const options = (page && page.options) || {};
    let pathname = '/' + route;
    let search = Object.keys(options)
      .map(key => key + '=' + options[key])
      .join('&');

    return stringifyLocation({ pathname, search });
  }

  function navTo(type, path) {
    if (convertToWmpNavType) {
      type = convertToWmpNavType(path, type);
    }

    return new Promise((resolve, reject) => {
      wx[type]({
        url: path,
        success: () => resolve(),
        fail: res => reject(new Error(res.errMsg)),
      });
    });
  }

  function wmpParseLocation(loc) {
    if (loc && typeof loc !== 'string') {
      loc = createPath(loc);
    }

    return parseLocation(loc);
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

  function navigateTo(route) {
    if (typeof route !== 'string') {
      route = stringifyLocation(route);
    }

    return navTo('navigateTo', route);
  }

  function redirectTo(route) {
    if (typeof route !== 'string') {
      route = stringifyLocation(route);
    }

    return navTo('redirectTo', route);
  }

  return {
    getTopPage,
    navigateBack,
    navigateTo,
    redirectTo,
    parseLocation: wmpParseLocation,
  };
}
