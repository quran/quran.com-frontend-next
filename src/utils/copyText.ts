import clipboardCopy from 'clipboard-copy';

/**
 * Copy text to clipboard
 *
 * Notes:
 * Safari supports `text/plain` : promise
 * Chrome doesn't support it.
 *
 * Safari needs `navigator.clipboard` to be called immediately without waiting
 * Chrome can wait
 *
 * So, for safari we call it navigator.clipboard immediately and give it a promise
 * for chrome we wait for the promise to resolve, the we call navigator.clipboard
 * (via clipboardCopy library, which also handle copying fallback for older browsers)
 *
 *
 * @param {Promise<Blob>} textBlobPromise
 */
const copyText = async (textBlobPromise: Promise<Blob>) => {
  try {
    // Try to copy with promise value (works in safari)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    navigator.clipboard.write([new ClipboardItem({ 'text/plain': textBlobPromise })]);
  } catch (e) {
    // otherwise fallback to use clipboardCopy library
    const blob = await textBlobPromise;
    const text = await blob.text();
    await clipboardCopy(text);
  }
};

export default copyText;
