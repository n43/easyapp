import initCore from '@easyapp/core';
import * as router from './router';

export default function(options) {
  return Promise.resolve(initCore(options)).then(apis => ({
    ...apis,
    ...router,
  }));
}
