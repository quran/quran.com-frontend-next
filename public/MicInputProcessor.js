/* eslint-disable no-undef */

class MicInputProcessor extends AudioWorkletProcessor {
  /**
   *
   * @param {Float32Array[][]} inputs
   * @returns {boolean} true
   */
  process(inputs) {
    // get the first channel of the first input since the processor might have multiple inputs and multiple channels for each input.
    // then after converting the data, send it to the AudioWorkletNode that is listening to messages from the processors.
    this.port.postMessage(convertFloat32ToInt16(inputs[0][0]));
    return true;
  }
}

/**
 *
 * @param {Float32Array} buffer
 * @returns {Int16Array} int16ArrayBuffer
 */
const convertFloat32ToInt16 = (buffer) => {
  let float32BufferLength = buffer.length;
  const int16ArrayBuffer = new Int16Array(float32BufferLength);
  // eslint-disable-next-line no-plusplus
  while (float32BufferLength--) {
    int16ArrayBuffer[float32BufferLength] = Math.min(1, buffer[float32BufferLength]) * 0x7fff;
  }

  return int16ArrayBuffer;
};

registerProcessor('MicInputProcessor', MicInputProcessor);

export default MicInputProcessor;
