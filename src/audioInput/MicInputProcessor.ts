class MicInputProcessor extends AudioWorkletProcessor {
  process(inputs: Float32Array[][]) {
    // get the first channel of the first input since the processor might have multiple inputs and multiple channels for each input.
    // then after converting the data, send it to the AudioWorkletNode that is listening to messages from the processors.
    this.port.postMessage(convertFloat32ToInt16(inputs[0][0]));
    return true;
  }
}

const convertFloat32ToInt16 = (buffer: Float32Array): Int16Array => {
  let float32BufferLength: number = buffer.length;
  const int16ArrayBuffer: Int16Array = new Int16Array(float32BufferLength);
  // eslint-disable-next-line no-plusplus
  while (float32BufferLength--) {
    int16ArrayBuffer[float32BufferLength] = Math.min(1, buffer[float32BufferLength]) * 0x7fff;
  }

  return int16ArrayBuffer;
};

registerProcessor('MicInputProcessor', MicInputProcessor);
export default MicInputProcessor;
