/**
 * check if currentTime is within range timestampFrom and timestampTo
 *
 * example:
 * - timestampFrom = 10, timestampTo = 20, currentTime = 10 should return true
 * - timestampFrom = 10, timestampTo = 20, currentTime = 11 should return true
 * - timestampFrom = 10, timestampTo = 20, currentTime = 20 should return false
 *
 * @param {number} currentTime
 * @param {number} timestampFrom
 * @param {number} timestampTo
 * @returns {boolean} isWithinRange
 */
const isCurrentTimeInRange = (currentTime: number, timestampFrom: number, timestampTo: number) =>
  currentTime >= timestampFrom && currentTime < timestampTo;

export default isCurrentTimeInRange;
