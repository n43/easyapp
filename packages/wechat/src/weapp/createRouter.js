export default function(weapp = {}, apis = {}, options = {}) {
  const { getTopPage, navigateBack, navigateTo, redirectTo } = apis;
  const { convertToWeappNavType, convertToWeappPage } = options;
  const WMP = weapp.wx.miniProgram;

  function navTo(type, path) {
    if (convertToWeappNavType) {
      type = convertToWeappNavType(path, type);
    }

    return new Promise((resolve, reject) => {
      WMP[type]({
        url: path,
        success: () => resolve(),
        fail: res => reject(new Error(res.errMsg)),
      });
    });
  }

  function weappNavigateBack() {
    const prevPath = getTopPage();

    return navigateBack().then(() => {
      const path = getTopPage();

      if (path === prevPath) {
        return new Promise((resolve, reject) =>
          WMP.navigateBack({
            delta: 1,
            success: () => resolve(),
            fail: res => reject(new Error(res.errMsg)),
          })
        );
      }
    });
  }

  function weappNavigateTo(route) {
    if (convertToWeappPage) {
      const weappPage = convertToWeappPage(route);

      if (typeof weappPage === 'string') {
        return navTo('navigateTo', weappPage);
      }
    }

    return navigateTo(route);
  }

  function weappRedirectTo(route) {
    if (convertToWeappPage) {
      const weappPage = convertToWeappPage(route);

      if (typeof weappPage === 'string') {
        return navTo('redirectTo', weappPage);
      }
    }

    return redirectTo(route);
  }

  return {
    navigateBack: weappNavigateBack,
    navigateTo: weappNavigateTo,
    redirectTo: weappRedirectTo,
  };
}
