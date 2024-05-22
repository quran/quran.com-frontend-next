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

export const isAppleWebKit = () => {
  const { userAgent } = navigator;
  return /AppleWebKit/.test(userAgent) && /Mobile/.test(userAgent);
};
