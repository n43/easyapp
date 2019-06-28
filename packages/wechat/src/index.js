import initWechat from './wechat';
import initWeapp from './weapp';

export default function(apis, options) {
  return new Promise(resolve => {
    if (!window.WeixinJSBridge) {
      document.addEventListener('WeixinJSBridgeReady', () => resolve(), false);
      return;
    }

    resolve();
  }).then(() => {
    if (window.__wxjs_environment === 'miniprogram') {
      return initWeapp(apis, options);
    }

    return initWechat(apis, options);
  });
}
