export function createNavigateBack(weapp = {}, apis = {}, options) {
  return function() {
    const { stringifyPageRoute, getTopPageRoute, navigateBack } = apis;

    const prevPath = stringifyPageRoute(getTopPageRoute());

    return navigateBack().then(() => {
      const path = stringifyPageRoute(getTopPageRoute());

      if (path === prevPath) {
        return new Promise(resolve => {
          weapp.wx.miniProgram.navigateBack({
            delta: 1,
            success: () => resolve(),
            fail: res => {
              throw new Error(res.errMsg);
            },
          });
        });
      }
    });
  };
}

export function createNavigateTo(weapp, apis = {}, options = {}) {
  return function(route) {
    const { navigateTo } = apis;
    const { convertToWeappRoute } = options;

    if (!convertToWeappRoute) {
      return navigateTo(route);
    }

    const weappRoute = convertToWeappRoute(route);

    if (weappRoute.web) {
      return navigateTo(route);
    }

    return navTo('navigateTo', weappRoute.url, weapp, apis, options);
  };
}

export function createRedirectTo(weapp, apis = {}, options = {}) {
  return function(route) {
    const { redirectTo } = apis;
    const { convertToWeappRoute } = options;

    if (!convertToWeappRoute) {
      return redirectTo(route);
    }

    const weappRoute = convertToWeappRoute(route);

    if (weappRoute.web) {
      return redirectTo(route);
    }

    return navTo('redirectTo', weappRoute.url, weapp, apis, options);
  };
}

function navTo(type, url, weapp = {}, apis, options = {}) {
  return new Promise(resolve => {
    const { convertToWeappNavType } = options;

    if (convertToWeappNavType) {
      type = convertToWeappNavType(type);
    }

    weapp.wx[type]({
      url,
      success: () => resolve(),
      fail: res => {
        throw new Error(res.errMsg);
      },
    });
  });
}
