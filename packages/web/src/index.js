import initCore from '@easyapp/core';
import initReact from '@easyapp/react';
import initWechat from '@easyapp/wechat';

export default function(options = {}) {
  return Promise.all([initCore(options.core), initReact(options.react)])
    .then(([coreAPIs, reactAPIs]) => ({ ...coreAPIs, ...reactAPIs }))
    .then(apis => {
      const ua = navigator.userAgent.toLowerCase();

      if (ua.indexOf('micromessenger') !== -1 && ua.indexOf('wxwork') === -1) {
        apis = initWechat(apis, options.wechat);
      }

      return apis;
    });
}
