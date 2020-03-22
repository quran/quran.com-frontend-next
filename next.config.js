const withPlugins = require('next-compose-plugins');
const withOptimizedImages = require('next-optimized-images');
const withFonts = require('next-fonts');

module.exports = withPlugins([[withOptimizedImages], [withFonts]]);
