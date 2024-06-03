import isClient from './isClient';

export const isMacOs = () => {
  if (!isClient) {
    return false;
  }
  return window.navigator.userAgent.search('Mac') !== -1;
};

export const isAppleDevice = () => {
  if (!isClient) {
    return false;
  }
  const isOSX = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
  return isOSX || isMacOs();
};

export const isSafari = () => {
  if (!isClient) {
    return false;
  }
  return (
    navigator.vendor &&
    navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent &&
    navigator.userAgent.indexOf('CriOS') === -1 &&
    navigator.userAgent.indexOf('FxiOS') === -1
  );
};

export const isAppleWebKit = () => {
  const { userAgent } = navigator;
  return /AppleWebKit/.test(userAgent) && /Mobile/.test(userAgent);
};

export const isFirefox = () => {
  if (!isClient) {
    return false;
  }

  const { userAgent } = navigator;
  return userAgent.toLowerCase().includes('firefox');
};
