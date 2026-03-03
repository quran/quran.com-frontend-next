const MOBILE_WIDTH = 768;
const DESKTOP_FONT_SCALE_CAP = 10;

export const MOBILE_FONT_SCALE_CAP = 3;

export const getMaxQuranScaleForViewport = (viewportWidth: number): number => {
  if (viewportWidth < MOBILE_WIDTH) return MOBILE_FONT_SCALE_CAP;
  return DESKTOP_FONT_SCALE_CAP;
};

export const clampQuranScaleForViewport = (scale: number, viewportWidth: number): number =>
  Math.min(scale, getMaxQuranScaleForViewport(viewportWidth));
