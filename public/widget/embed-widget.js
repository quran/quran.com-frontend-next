/* eslint-disable func-names */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-param-reassign */
(function () {
  const RESIZE_MESSAGE = 'quran-embed:resize';
  const REQUEST_MESSAGE = 'quran-embed:request-resize';
  const IFRAME_SELECTOR = 'iframe[data-quran-embed="true"], iframe[src*="/embed/v1"]';

  const trackedIframes = new Set();

  const parseHeight = function (value) {
    const height = Number(value);
    if (!isFinite(height) || height <= 0) return null;
    return Math.ceil(height);
  };

  const findIframeBySource = function (source) {
    if (!source) return null;
    const iterator = trackedIframes.values();
    let entry = iterator.next();
    while (!entry.done) {
      const iframe = entry.value;
      if (iframe && iframe.contentWindow === source) return iframe;
      entry = iterator.next();
    }
    return null;
  };

  const updateIframeHeight = function (iframe, height) {
    const heightValue = `${height}px`;
    iframe.style.height = heightValue;
    iframe.setAttribute('height', heightValue);
  };

  const requestResize = function (iframe) {
    if (!iframe || !iframe.contentWindow) return;
    try {
      iframe.contentWindow.postMessage({ type: REQUEST_MESSAGE }, '*');
    } catch (error) {
      // Ignore cross-origin or inaccessible iframes.
    }
  };

  const applyMaxHeight = function (iframe) {
    if (!iframe) return;
    const maxHeight = iframe.getAttribute('data-quran-embed-max-height');
    if (maxHeight) {
      iframe.style.maxHeight = maxHeight;
    }
  };

  const trackIframe = function (iframe) {
    if (!iframe || trackedIframes.has(iframe)) return;
    trackedIframes.add(iframe);
    applyMaxHeight(iframe);
    iframe.addEventListener('load', () => {
      requestResize(iframe);
    });
    requestResize(iframe);
  };

  const scanForIframes = function (root) {
    if (!root || !root.querySelectorAll) return;
    const iframes = root.querySelectorAll(IFRAME_SELECTOR);
    for (let i = 0; i < iframes.length; i += 1) {
      trackIframe(iframes[i]);
    }
  };

  const onMessage = function (event) {
    if (!event || !event.data) return;
    if (event.data.type !== RESIZE_MESSAGE) return;
    const height = parseHeight(event.data.height);
    if (!height) return;
    const iframe = findIframeBySource(event.source);
    if (!iframe) return;
    updateIframeHeight(iframe, height);
  };

  const init = function () {
    scanForIframes(document);
    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLIFrameElement) {
            trackIframe(node);
          } else if (node.querySelectorAll) {
            scanForIframes(node);
          }
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };

  window.addEventListener('message', onMessage);
  window.addEventListener('resize', () => {
    trackedIframes.forEach((iframe) => {
      requestResize(iframe);
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
