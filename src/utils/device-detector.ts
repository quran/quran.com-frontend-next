import isClient from './isClient';

export const isSafari = () => {
  if (!isClient) {
    return false;
  }

  const { userAgent } = navigator;
  const safari = userAgent.toLowerCase().includes('safari');
  const chrome = userAgent.toLowerCase().includes('chrome');
  return safari && !chrome;
};

export const isChromeIOS = () => {
  if (!isClient) {
    return false;
  }
  return navigator.userAgent.match('CriOS');
};

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
