const MOBILE_M_WIDTH = 375;
const TABLET_WIDTH = 768;

// eslint-disable-next-line import/prefer-default-export
export const isMobile = () => {
  if (typeof document === 'undefined') return false;
  return document.documentElement.clientWidth < TABLET_WIDTH;
};

export const isSmallMobile = () => {
  if (typeof document === 'undefined') return false;
  return document.documentElement.clientWidth < MOBILE_M_WIDTH;
};
