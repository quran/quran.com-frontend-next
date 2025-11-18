/* eslint-disable import/prefer-default-export */
/**
 * Z-index variant enum for controlling stacking order
 */
enum ZIndexVariant {
  DEFAULT = 'default', // Uses --z-index-overlay (500)
  MODAL = 'modal', // Uses --z-index-modal (800)
  HIGH = 'high', // Uses --z-index-high (999)
  ULTRA = 'ultra', // Uses --z-index-ultra (1200)
}

export default ZIndexVariant;
