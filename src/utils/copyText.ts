import clipboardCopy from 'clipboard-copy';

const copyText = async (textBlobPromise: Promise<Blob>) => {
  try {
    // Try to copy with promise value (works in safar)
    navigator.clipboard.write([new ClipboardItem({ 'text/plain': textBlobPromise })]);
  } catch (e) {
    // otherwise fallback to use clipboardCopy library
    const blob = await textBlobPromise;
    const text = await blob.text();
    await clipboardCopy(text);
  }
};

export default copyText;
