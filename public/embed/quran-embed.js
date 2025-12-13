/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
(function () {
  const currentScript =
    document.currentScript || document.querySelector('script[data-quran-target]');

  if (!currentScript) {
    console.error('[Quran Embed] Unable to locate the script element.');
    return;
  }

  const scriptUrl = new URL(currentScript.src, window.location.href);
  const apiOrigin = currentScript.getAttribute('data-quran-origin') || scriptUrl.origin;

  const config = {
    target: currentScript.getAttribute('data-quran-target'),
    ayah: currentScript.getAttribute('data-quran-ayah') || '33:56',
    translationIds: currentScript.getAttribute('data-quran-translation-ids') || '',
    reciterId: currentScript.getAttribute('data-quran-reciter-id') || '7',
    audio: currentScript.getAttribute('data-quran-audio') || 'true',
    wordByWord: currentScript.getAttribute('data-quran-word-by-word') || 'false',
    theme: currentScript.getAttribute('data-quran-theme') || 'light',
    showTranslatorNames: currentScript.getAttribute('data-quran-show-translator-names') || 'false',
    showQuranLink: currentScript.getAttribute('data-quran-show-quran-link') || 'false',
    mushaf: currentScript.getAttribute('data-quran-mushaf') || 'qpc',
    width: currentScript.getAttribute('data-width') || '',
    height: currentScript.getAttribute('data-height') || '',
  };

  if (!config.target) {
    console.error('[Quran Embed] Missing data-quran-target attribute.');
    return;
  }

  const container = document.getElementById(config.target);

  if (!container) {
    console.error(`[Quran Embed] Unable to find element with id "${config.target}".`);
    return;
  }

  container.innerHTML =
    '<div style="padding:16px;text-align:center;color:#4b5563;font-family:system-ui;">Loading Quran verse...</div>';

  const apiUrl = new URL('/api/ayah-widget', apiOrigin);
  const setParam = (key, value) => {
    if (value !== null && value !== undefined && String(value).length > 0) {
      apiUrl.searchParams.set(key, value);
    }
  };

  setParam('ayah', config.ayah);
  setParam('translations', config.translationIds);
  setParam('reciter', config.reciterId);
  setParam('audio', config.audio);
  setParam('wbw', config.wordByWord);
  setParam('theme', config.theme);
  setParam('showTranslatorNames', config.showTranslatorNames);
  setParam('showQuranLink', config.showQuranLink);
  setParam('width', config.width);
  setParam('height', config.height);
  setParam('mushaf', config.mushaf);

  const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (error) {
      console.error('[Quran Embed] Copy command failed.', error);
    }
    document.body.removeChild(textarea);
  };

  const copyVerse = (root) => {
    const verseNode = root.querySelector('[data-verse-text]');
    const translationNodes = root.querySelectorAll('[data-translation-text]');
    if (!verseNode) {
      return;
    }

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
    const pieces = [];
    const { verseKey } = verseNode.dataset;
    const { surahName } = verseNode.dataset;
    const { arabicVerse } = verseNode.dataset;

    if (surahName && verseKey) {
      pieces.push(`${surahName} (${verseKey})`);
    }

    if (arabicVerse && verseKey) {
      const verseNumber = verseKey.split(':')[1] || '';
      const arabicVerseNumber = verseNumber
        .split('')
        .map((digit) => {
          const index = Number(digit);
          return Number.isNaN(index) ? digit : arabicDigits[index] || digit;
        })
        .join('');
      pieces.push(`${arabicVerse} ${arabicVerseNumber}`.trim());
    }

    translationNodes.forEach((node) => {
      const text = node.textContent ? node.textContent.trim() : '';
      if (!text) {
        return;
      }
      const translator = node.dataset.translatorName;
      pieces.push(translator ? `${text}\n-- ${translator}` : text);
    });

    if (verseKey) {
      pieces.push(`https://quran.com/${verseKey.replace(':', '/')}`);
    }

    const combined = pieces.join('\n\n');
    if (!combined) {
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(combined).catch(() => fallbackCopy(combined));
    } else {
      fallbackCopy(combined);
    }
  };

  const wireWidgetInteractions = (root) => {
    const audioButton = root.querySelector('[data-audio-button]');
    const audioElement = root.querySelector('[data-audio-element]');
    const playIcon = root.querySelector('[data-play-icon]');
    const pauseIcon = root.querySelector('[data-pause-icon]');
    const menuToggle = root.querySelector('[data-menu-toggle]');
    const menu = root.querySelector('[data-menu]');
    const copyButton = root.querySelector('[data-copy-verse]');

    if (audioButton && audioElement) {
      const startValue = parseFloat(audioElement.dataset.audioStart || '0');
      const endValue = audioElement.dataset.audioEnd
        ? parseFloat(audioElement.dataset.audioEnd)
        : null;
      let shouldReset = true;

      const resetToStart = () => {
        if (!Number.isNaN(startValue)) {
          audioElement.currentTime = startValue;
        } else {
          audioElement.currentTime = 0;
        }
      };

      const updateUi = () => {
        const playing = !audioElement.paused && !audioElement.ended;
        audioButton.setAttribute('aria-pressed', playing ? 'true' : 'false');
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

    if (menuToggle && menu) {
      menuToggle.addEventListener('click', (event) => {
        event.preventDefault();
        const isOpen = menu.getAttribute('data-open') === 'true';
        menu.style.display = isOpen ? 'none' : 'block';
        menu.setAttribute('data-open', isOpen ? 'false' : 'true');
      });
    }

    if (copyButton) {
      copyButton.addEventListener('click', () => {
        copyVerse(root);
        if (menu) {
          menu.style.display = 'none';
          menu.setAttribute('data-open', 'false');
        }
      });
    }
  };

  fetch(apiUrl.toString())
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return response.json();
    })
    .then((payload) => {
      if (!payload || !payload.success || !payload.html) {
        throw new Error(payload?.error || 'Unexpected response from widget API.');
      }

      container.innerHTML = payload.html;
      wireWidgetInteractions(container);
    })
    .catch((error) => {
      console.error('[Quran Embed] Failed to load widget.', error);
      container.innerHTML =
        '<div style="padding:16px;border:1px solid #fecaca;background:#fef2f2;border-radius:8px;color:#991b1b;font-family:system-ui;">Error loading verse. Please try again later.</div>';
    });
})();
