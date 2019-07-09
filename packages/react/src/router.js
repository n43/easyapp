import { createHashHistory, createPath } from 'history';

export default function(apis = {}, options) {
  const { stringifyLocation, parseLocation } = apis;
  const history = createHashHistory();

  function getTopPage() {
    const loc = history.location;

    return stringifyLocation({
      pathname: loc.pathname,
      search: loc.search,
      hash: loc.hash,
    });
  }

  function navigateTo(route) {
    if (typeof route !== 'string') {
      route = stringifyLocation(route);
    }

    history.push(route);
    return delay();
  }
  function redirectTo(route) {
    if (typeof route !== 'string') {
      route = stringifyLocation(route);
    }

    history.replace(route);
    return delay();
  }

  function navigateBack() {
    history.goBack();
    return delay();
  }

  return {
    history,
    getTopPage,
    navigateTo,
    redirectTo,
    navigateBack,
    parseLocation: loc => {
      if (loc && typeof loc !== 'string') {
        loc = createPath(loc);
      }

      return parseLocation(loc);
    },
  };
}

function delay() {
  return new Promise(resolve => setTimeout(() => resolve(), 50));
}
