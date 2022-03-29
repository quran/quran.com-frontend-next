/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */
// @ts-nocheck

// Source: https://github.com/huang47/nodejs-html-truncate/blob/master/lib/truncate.js

function truncate(string, maxLength, options?) {
  const EMPTY_OBJECT = {};
  const EMPTY_STRING = '';
  const DEFAULT_TRUNCATE_SYMBOL = '...';
  const DEFAULT_SLOP = maxLength < 10 ? maxLength : 10;
  const EXCLUDE_TAGS = ['img', 'br']; // non-closed tags
  const items = []; // stack for saving tags
  let total = 0; // record how many characters we traced so far
  let content = EMPTY_STRING; // truncated text storage
  const KEY_VALUE_REGEX = '([\\w|-]+\\s*=\\s*"[^"]*"\\s*)*';
  const IS_CLOSE_REGEX = '\\s*\\/?\\s*';
  const CLOSE_REGEX = '\\s*\\/\\s*';
  const SELF_CLOSE_REGEX = new RegExp(`<\\/?\\w+\\s*${KEY_VALUE_REGEX}${CLOSE_REGEX}>`);
  const HTML_TAG_REGEX = new RegExp(`<\\/?\\w+\\s*${KEY_VALUE_REGEX}${IS_CLOSE_REGEX}>`);
  const URL_REGEX =
    /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w\-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g; // Simple regexp
  const IMAGE_TAG_REGEX = new RegExp(`<img\\s*${KEY_VALUE_REGEX}${IS_CLOSE_REGEX}>`);
  const WORD_BREAK_REGEX = new RegExp('\\W+', 'g');
  let matches = true;
  let result;
  let index;
  let tail;
  let tag;
  let selfClose;

  /**
   * Remove image tag
   *
   * @private
   * @function _removeImageTag
   * @param {string} string not-yet-processed string
   * @returns {string} string without image tags
   */
  function _removeImageTag(string) {
    const match = IMAGE_TAG_REGEX.exec(string);
    let index;
    let len;

    if (!match) {
      return string;
    }

    index = match.index;
    len = match[0].length;

    return string.substring(0, index) + string.substring(index + len);
  }

  /**
   * Dump all close tags and append to truncated content while reaching upperbound
   *
   * @private
   * @function _dumpCloseTag
   * @param {string[]} tags a list of tags which should be closed
   * @returns {string} well-formatted html
   */
  function _dumpCloseTag(tags) {
    let html = '';

    tags.reverse().forEach((tag, index) => {
      // dump non-excluded tags only
      if (EXCLUDE_TAGS.indexOf(tag) === -1) {
        html += `</${tag}>`;
      }
    });

    return html;
  }

  /**
   * Process tag string to get pure tag name
   *
   * @private
   * @function _getTag
   * @param {string} string original html
   * @returns {string} tag name
   */
  function _getTag(string) {
    let tail = string.indexOf(' ');

    // TODO:
    // we have to figure out how to handle non-well-formatted HTML case
    if (tail === -1) {
      tail = string.indexOf('>');
      if (tail === -1) {
        throw new Error(`HTML tag is not well-formed : ${string}`);
      }
    }

    return string.substring(1, tail);
  }

  /**
   * Get the end position for String#substring()
   *
   * If options.truncateLastWord is FALSE, we try to the end position up to
   * options.slop characters to avoid breaking in the middle of a word.
   *
   * @private
   * @function _getEndPosition
   * @param {string} string original html
   * @param {number} tailPos (optional) provided to avoid extending the slop into trailing HTML tag
   * @returns {number} maxLength
   */
  function _getEndPosition(string, tailPos) {
    const defaultPos = maxLength - total;
    let position = defaultPos;
    const isShort = defaultPos < options.slop;
    const slopPos = isShort ? defaultPos : options.slop - 1;
    let substr;
    const startSlice = isShort ? 0 : defaultPos - options.slop;
    const endSlice = tailPos || defaultPos + options.slop;
    let result;

    if (!options.truncateLastWord) {
      substr = string.slice(startSlice, endSlice);

      if (tailPos && substr.length <= tailPos) {
        position = substr.length;
      } else {
        while ((result = WORD_BREAK_REGEX.exec(substr)) !== null) {
          // a natural break position before the hard break position
          if (result.index < slopPos) {
            position = defaultPos - (slopPos - result.index);
            // keep seeking closer to the hard break position
            // unless a natural break is at position 0
            if (result.index === 0 && defaultPos <= 1) break;
          }
          // a natural break position exactly at the hard break position
          else if (result.index === slopPos) {
            position = defaultPos;
            break; // seek no more
          }
          // a natural break position after the hard break position
          else {
            position = defaultPos + (result.index - slopPos);
            break; // seek no more
          }
        }
      }
      if (string.charAt(position - 1).match(/\s$/)) position--;
    }
    return position;
  }

  options = options || EMPTY_OBJECT;
  options.ellipsis = undefined !== options.ellipsis ? options.ellipsis : DEFAULT_TRUNCATE_SYMBOL;
  options.truncateLastWord =
    undefined !== options.truncateLastWord ? options.truncateLastWord : true;
  options.slop = undefined !== options.slop ? options.slop : DEFAULT_SLOP;

  while (matches) {
    matches = HTML_TAG_REGEX.exec(string);

    if (!matches) {
      if (total >= maxLength) {
        break;
      }

      matches = URL_REGEX.exec(string);
      if (!matches || matches.index >= maxLength) {
        content += string.substring(0, _getEndPosition(string));
        break;
      }

      while (matches) {
        result = matches[0];
        index = matches.index;
        content += string.substring(0, index + result.length - total);
        string = string.substring(index + result.length);
        matches = URL_REGEX.exec(string);
      }
      break;
    }

    result = matches[0];
    index = matches.index;

    if (total + index > maxLength) {
      // exceed given `maxLength`, dump everything to clear stack
      content += string.substring(0, _getEndPosition(string, index));
      break;
    } else {
      total += index;
      content += string.substring(0, index);
    }

    if (result[1] === '/') {
      // move out open tag
      items.pop();
      selfClose = null;
    } else {
      selfClose = SELF_CLOSE_REGEX.exec(result);
      if (!selfClose) {
        tag = _getTag(result);

        items.push(tag);
      }
    }

    if (selfClose) {
      content += selfClose[0];
    } else {
      content += result;
    }
    string = string.substring(index + result.length);
  }

  if (string.length > maxLength - total && options.ellipsis) {
    content += options.ellipsis;
  }
  content += _dumpCloseTag(items);

  if (!options.keepImageTag) {
    content = _removeImageTag(content);
  }

  return content;
}

export default truncate;
