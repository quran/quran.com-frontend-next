/* eslint-disable import/prefer-default-export */
export const getAverageVolume = (analyser: AnalyserNode, volumes: Uint8Array) => {
  analyser.getByteFrequencyData(volumes);
  let values = 0;

  const { length } = volumes;
  for (let i = 0; i < length; i += 1) {
    values += volumes[i];
  }
  const volume = Math.round(values / length);
  return volume > 100 ? 100 : volume;
};

/**
 * Get the value that will be used inside css as a multiplier of the base width
 * and height of the audio visualizer circle.
 *
 * @param {number} volume
 * @returns {number}
 */
export const getVolumeLevelMultiplier = (volume: number): number => {
  return Math.max((volume * 1.5) / 100) + 1;
};
