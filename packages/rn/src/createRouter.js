import { StackActions } from 'react-navigation';
import { getSharedRouterRef } from './Router';

export default function(apis = {}, options) {
  const { stringifyLocation, parseLocation } = apis;

  function createUrl({ path, params }) {
    return stringifyLocation({ pathname: '/' + path, searchData: params });
  }
  function createRoute(url) {
    const { pathname, searchData } = parseLocation(url);

    return { path: pathname.substr(1), params: searchData };
  }

  function rnParseLocation(url) {
    if (typeof url !== 'string') {
      url = createUrl(url);
    }

    return parseLocation(url);
  }

  function getTopPage() {
    let topRoute = getSharedRouterRef().state.nav;
    let path = [];

    while (topRoute.routes) {
      if (topRoute.routeName) {
        path.push(topRoute.routeName);
      }
      topRoute = topRoute.routes[topRoute.index];
    }

    path.push(topRoute.routeName);

    return createUrl({ path: path.join('/'), params: topRoute.params });
  }

  function navigateBack() {
    return getSharedRouterRef().dispatch(StackActions.pop({ n: 1 }));
  }

  function navigateTo(route) {
    if (typeof route !== 'string') {
      route = stringifyLocation(route);
    }
    route = createRoute(route);

    const Router = getSharedRouterRef().constructor;
    const { getActionForPathAndParams } = Router.router;

    const action = getActionForPathAndParams(route.path, route.params);
    action.type = StackActions.PUSH;

    return getSharedRouterRef().dispatch(action);
  }

  function redirectTo(route) {
    if (typeof route !== 'string') {
      route = stringifyLocation(route);
    }
    route = createRoute(route);

    const Router = getSharedRouterRef().constructor;
    const { getActionForPathAndParams } = Router.router;

    const action = getActionForPathAndParams(route.path, route.params);
    action.type = StackActions.REPLACE;

    return getSharedRouterRef().dispatch(action);
  }

  return {
    getTopPage,
    navigateBack,
    navigateTo,
    redirectTo,
    parseLocation: rnParseLocation,
  };
}
