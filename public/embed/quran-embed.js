/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
/**
 * Quran Embed Script
 *
 * Responsibilities:
 * 1) Locate the <script> tag that loaded this file (or a script with data-quran-target).
 * 2) Read configuration from data-* attributes on that <script>.
 * 3) Call the widget API endpoint that returns server-rendered HTML for the Ayah widget.
 * 4) Inject that HTML into the target container.
 * 5) Wire minimal client-side interactions (audio play/pause, copy, menu toggle).
 *
 * Security:
 * - The widget API is expected to return trusted HTML, but we still do a basic sanitization
 *   as a defense-in-depth measure (remove scripts/iframes and inline event handlers).
 */
(function quranEmbedBootstrap() {
  /**
   * Try to locate the script element which loaded this file.
   * Fallback: find any script that contains data-quran-target.
   */
  const currentScript =
    document.currentScript || document.querySelector('script[data-quran-target]');

  if (!currentScript) {
    // eslint-disable-next-line no-console
    console.error('[Quran Embed] Unable to locate the script element.');
    return;
  }

  const scriptUrl = new URL(currentScript.src, window.location.href);

  // Determine API origin
  const apiOrigin = currentScript.getAttribute('data-quran-origin') || scriptUrl.origin;

  /**
   * Read configuration from script tag attributes.
   * Keep defaults here so the embed snippet can omit some attributes.
   */
  const config = {
    target: currentScript.getAttribute('data-quran-target'),
    allowRerender: currentScript.getAttribute('data-quran-allow-rerender') === 'true',

    // Content
    ayah: currentScript.getAttribute('data-quran-ayah') || '33:56',
    rangeEnd: currentScript.getAttribute('data-quran-range-end') || '',

    // Data + rendering
    translationIds: currentScript.getAttribute('data-quran-translation-ids') || '',
    reciterId: currentScript.getAttribute('data-quran-reciter-id') || '7',
    mushaf: currentScript.getAttribute('data-quran-mushaf') || 'qpc',
    theme: currentScript.getAttribute('data-quran-theme') || 'light',
    showArabic: currentScript.getAttribute('data-quran-show-arabic') || 'true',

    // Features
    audio: currentScript.getAttribute('data-quran-audio') || 'true',
    wordByWord: currentScript.getAttribute('data-quran-word-by-word') || 'false',
    showTranslatorNames: currentScript.getAttribute('data-quran-show-translator-names') || 'false',
    showQuranLink: currentScript.getAttribute('data-quran-show-quran-link') || 'false',
    showTafsirs: currentScript.getAttribute('data-quran-show-tafsirs') || 'true',
    showReflections: currentScript.getAttribute('data-quran-show-reflections') || 'true',
    showAnswers: currentScript.getAttribute('data-quran-show-answers') || 'true',

    // Layout
    width: currentScript.getAttribute('data-width') || '',
    height: currentScript.getAttribute('data-height') || '',
  };

  if (!config.target) {
    // eslint-disable-next-line no-console
    console.error('[Quran Embed] Missing data-quran-target attribute.');
    return;
  }

  /**
   * Prevent re-rendering the same target unless explicitly allowed.
   * This is especially helpful when the script is included multiple times.
   */
  if (!window.QURAN_EMBED_RENDERED_TARGETS) {
    window.QURAN_EMBED_RENDERED_TARGETS = new Set();
  }

  if (!config.allowRerender && window.QURAN_EMBED_RENDERED_TARGETS.has(config.target)) {
    return;
  }

  if (!config.allowRerender) {
    window.QURAN_EMBED_RENDERED_TARGETS.add(config.target);
  }

  // Locate target container
  const container = document.getElementById(config.target);

  if (!container) {
    // eslint-disable-next-line no-console
    console.error(`[Quran Embed] Unable to find element with id "${config.target}".`);
    return;
  }

  // === State Management ===
  const setLoadingState = () => {
    container.innerHTML =
      '<div style="padding:16px;text-align:center;color:#4b5563;font-family:system-ui;">Loading Quran verse...</div>';
  };

  const setErrorState = () => {
    container.innerHTML =
      '<div style="padding:16px;border:1px solid #fecaca;background:#fef2f2;border-radius:8px;color:#991b1b;font-family:system-ui;">Error loading verse. Please try again later.</div>';
  };

  /**
   * Widget API endpoint: returns JSON with server-rendered HTML.
   * Expected payload: { success: boolean, html?: string, error?: string }
   */
  const apiUrl = new URL('/api/ayah-widget', apiOrigin);

  /**
   * Add a query param only if value is non-empty.
   */
  const setParam = (key, value) => {
    if (value === null || value === undefined) return;
    if (String(value).length === 0) return;
    apiUrl.searchParams.set(key, value);
  };

  setParam('ayah', config.ayah);
  setParam('rangeEnd', config.rangeEnd);

  setParam('translations', config.translationIds);
  setParam('reciter', config.reciterId);

  setParam('audio', config.audio);
  setParam('wbw', config.wordByWord);

  setParam('theme', config.theme);
  setParam('mushaf', config.mushaf);
  setParam('showArabic', config.showArabic);

  setParam('showTranslatorNames', config.showTranslatorNames);
  setParam('showQuranLink', config.showQuranLink);
  setParam('showTafsirs', config.showTafsirs);
  setParam('showReflections', config.showReflections);
  setParam('showAnswers', config.showAnswers);

  setParam('width', config.width);
  setParam('height', config.height);

  /**
   * Legacy clipboard fallback for older browsers.
   */
  const fallbackCopyToClipboard = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;

    // Move off-screen
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand('copy');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Quran Embed] Copy command failed.', error);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  /**
   * Convert Latin digits to Arabic-Indic digits.
   * @param {string} value - The input string containing Latin digits.
   * @returns {string} - The input string with Latin digits replaced by Arabic-Indic digits.
   */
  const toArabicNumber = (value = '') => {
    const arabicDigits = [
      '\u0660',
      '\u0661',
      '\u0662',
      '\u0663',
      '\u0664',
      '\u0665',
      '\u0666',
      '\u0667',
      '\u0668',
      '\u0669',
    ];
    return value.replace(/\d/g, (digit) => arabicDigits[Number(digit)] ?? digit);
  };

  /**
   * Extract visible Arabic + translations from the widget DOM and copy to clipboard.
   * This expects the server-rendered HTML to include specific data-* hooks.
   */
  const copyVerse = (root) => {
    const wrapper = root.querySelector('[data-translations-wrapper]');
    if (!wrapper) return;

    const verseBlocks = wrapper.querySelectorAll('[data-verse-block]');
    if (!verseBlocks.length) return;

    const { rangeCaption } = wrapper.dataset;
    const chapterFromCaption = rangeCaption?.split(':')[0] || '';
    const urlSuffix = rangeCaption?.split(':')[1] || '';
    const url =
      chapterFromCaption && urlSuffix
        ? `https://quran.com/${chapterFromCaption}/${urlSuffix.replace(':', '-')}`
        : '';

    const { surahName } = verseBlocks[0].dataset;

    const arabicPieces = [];
    const translationPieces = [];

    // Iterate over each verse block
    verseBlocks.forEach((block) => {
      const verseKey = block.dataset.verseKey || '';
      const verseNumber = block.dataset.verseNumber || verseKey.split(':')[1] || '';
      const verseNumberArabic = toArabicNumber(verseNumber);

      // Arabic
      const arabicNode = block.querySelector('[data-verse-text]');
      if (arabicNode?.dataset?.arabicVerse) {
        arabicPieces.push(`${arabicNode.dataset.arabicVerse.trim()} ${verseNumberArabic}`);
      }

      // Translations
      const translationNodes = block.querySelectorAll('[data-translation-text]');
      translationNodes.forEach((node) => {
        const text = node.textContent ? node.textContent.trim() : '';
        if (!text) return;

        const translator = node.dataset.translatorName;
        const prefix = verseBlocks.length > 1 ? `${verseNumber}. ` : '';
        const suffix = ` ${verseNumberArabic}`;

        translationPieces.push(
          translator ? `${prefix}${text}${suffix}\n- ${translator}` : `${prefix}${text}${suffix}`,
        );
      });
    });

    // Create heading
    const heading =
      surahName && rangeCaption ? `${surahName} (${rangeCaption})` : rangeCaption || '';

    // Create final combined text
    const parts = [
      heading,
      arabicPieces.length ? arabicPieces.join('\n') : '',
      translationPieces.length ? translationPieces.join('\n\n') : '',
      url,
    ].filter(Boolean);

    const combined = parts.join('\n\n');
    if (!combined) return;

    // Copy to clipboard
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(combined).catch(() => fallbackCopyToClipboard(combined));
    } else {
      fallbackCopyToClipboard(combined);
    }
  };

  /**
   * Wire client-side interactions after HTML injection.
   * Assumes the server returned HTML contains expected data-* hooks.
   */
  const wireWidgetInteractions = (root) => {
    const audioButton = root.querySelector('[data-audio-button]');
    const audioElement = root.querySelector('[data-audio-element]');
    const playIcon = root.querySelector('[data-play-icon]');
    const pauseIcon = root.querySelector('[data-pause-icon]');

    const copyButton = root.querySelector('[data-copy-verse]');
    const shareButton = root.querySelector('[data-share-verse]');

    // === Audio play/pause logic ===
    if (audioButton && audioElement) {
      const startValue = parseFloat(audioElement.dataset.audioStart || '0');
      const endValue = audioElement.dataset.audioEnd
        ? parseFloat(audioElement.dataset.audioEnd)
        : null;

      let shouldReset = true;

      const resetToStart = () => {
        audioElement.currentTime = Number.isNaN(startValue) ? 0 : startValue;
      };

      const updateUi = () => {
        const playing = !audioElement.paused && !audioElement.ended;
        audioButton.setAttribute('aria-pressed', playing ? 'true' : 'false');
        audioButton.setAttribute('aria-label', playing ? 'Pause audio' : 'Play audio');

        if (playIcon && pauseIcon) {
          playIcon.style.display = playing ? 'none' : 'inline-flex';
          pauseIcon.style.display = playing ? 'inline-flex' : 'none';
        }
      };

      audioButton.addEventListener('click', () => {
        if (audioElement.paused) {
          if (shouldReset) {
            resetToStart();
            shouldReset = false;
          }
          audioElement.play();
        } else {
          audioElement.pause();
        }
      });

      audioElement.addEventListener('play', () => {
        if (shouldReset) {
          resetToStart();
          shouldReset = false;
        }
        updateUi();
      });

      audioElement.addEventListener('pause', updateUi);

      audioElement.addEventListener('timeupdate', () => {
        if (endValue !== null && !Number.isNaN(endValue) && audioElement.currentTime >= endValue) {
          audioElement.pause();
          shouldReset = true;
          resetToStart();
        }
      });

      audioElement.addEventListener('ended', () => {
        shouldReset = true;
        resetToStart();
        updateUi();
      });

      updateUi();
    }

    // === Copy button logic ===
    if (copyButton) {
      copyButton.addEventListener('click', () => {
        copyVerse(root);
      });
    }

    // === Share button logic ===
    if (shareButton) {
      const buildShareUrl = () => {
        const wrapper = root.querySelector('[data-translations-wrapper]');
        const rangeCaption = wrapper?.dataset?.rangeCaption;
        if (rangeCaption) {
          return `https://quran.com/${rangeCaption}`;
        }
        const firstVerse = root.querySelector('[data-verse-block]');
        const verseKey = firstVerse?.dataset?.verseKey;
        if (verseKey) {
          return `https://quran.com/${verseKey}`;
        }
        return '';
      };

      shareButton.addEventListener('click', () => {
        const url = buildShareUrl();
        if (!url) return;

        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(url).catch(() => fallbackCopyToClipboard(url));
        } else {
          fallbackCopyToClipboard(url);
        }
      });
    }
  };

  /**
   * Basic HTML sanitizer.
   * Removes dangerous tags and inline JS event handlers (onClick, etc.).
   *
   * @param {string} html - The input HTML string to sanitize.
   * @returns {string} - The sanitized HTML string.
   */
  const sanitizeHtml = (html) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Remove tags that may introduce active content
      const dangerousTags = new Set(['script', 'iframe', 'object', 'embed', 'link', 'meta']);
      const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);

      const toRemove = [];
      while (walker.nextNode()) {
        const el = walker.currentNode;

        if (dangerousTags.has(el.tagName.toLowerCase())) {
          toRemove.push(el);
          // continue
          // eslint-disable-next-line no-continue
          continue;
        }

        // Remove inline handlers and javascript: URLs
        Array.from(el.attributes).forEach((attr) => {
          const name = attr.name.toLowerCase();
          const value = attr.value.toLowerCase();
          // eslint-disable-next-line no-script-url
          if (name.startsWith('on') || value.includes('javascript:')) {
            el.removeAttribute(attr.name);
          }
        });
      }

      toRemove.forEach((el) => el.remove());
      return doc.body.innerHTML;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Quran Embed] Failed to sanitize HTML.', error);
      return html;
    }
  };

  // === Main Execution ===
  // 1. Set loading state
  setLoadingState();

  // 2. Fetch widget HTML from API
  fetch(apiUrl.toString())
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return response.json();
    })
    .then((payload) => {
      if (!payload || !payload.success || !payload.html) {
        throw new Error(payload?.error || 'Unexpected response from widget API.');
      }

      // 3. Inject sanitized HTML
      container.innerHTML = sanitizeHtml(payload.html);
      wireWidgetInteractions(container);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('[Quran Embed] Failed to load widget.', error);
      setErrorState();
    });
})();
