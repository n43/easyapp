import { createHashHistory, createPath, parsePath } from 'history';

export const history = createHashHistory();

export function stringifyPageRoute(route) {
  return createPath(route);
}

export function parsePageRoute(path) {
  return parsePath(path);
}

export function getTopPageRoute() {
  return history.location;
}

export function navigateTo(route) {
  history.push(route);
  return delay();
}
export function redirectTo(route) {
  history.replace(route);
  return delay();
}

export function navigateBack() {
  history.goBack();
  return delay();
}

function delay() {
  return new Promise(resolve => setTimeout(() => resolve(), 50));
}
