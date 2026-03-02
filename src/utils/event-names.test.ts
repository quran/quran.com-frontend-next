import { it, expect, describe } from 'vitest';

import EventName, { getEventName } from './event-names';

// eslint-disable-next-line react-func/max-lines-per-function
describe('getEventName', () => {
  it('should return just the event name when no prefix or suffix is provided', () => {
    const result = getEventName({
      eventName: EventName.QURAN_READER_BOTTOM_ACTION_SCROLLABLE,
    });
    expect(result).toBe('quran_reader_bottom_action_scrollable');
  });

  it('should prepend the prefix with an underscore', () => {
    const result = getEventName({
      eventName: EventName.QURAN_READER_BOTTOM_ACTION_SCROLLABLE,
      prefix: 'click',
    });
    expect(result).toBe('click_quran_reader_bottom_action_scrollable');
  });

  it('should append the suffix with an underscore', () => {
    const result = getEventName({
      eventName: EventName.QURAN_READER_BOTTOM_ACTION_SCROLLABLE,
      suffix: 'tab',
    });
    expect(result).toBe('quran_reader_bottom_action_scrollable_tab');
  });

  it('should include both prefix and suffix when provided', () => {
    const result = getEventName({
      eventName: EventName.QURAN_READER_END_OF_SURAH_CTA,
      prefix: 'click',
      suffix: 'button',
    });
    expect(result).toBe('click_quran_reader_end_of_surah_cta_button');
  });

  it('should ignore undefined prefix', () => {
    const result = getEventName({
      eventName: EventName.QURAN_READER_TRANSLATION_REFERENCE,
      prefix: undefined,
    });
    expect(result).toBe('quran_reader_translation_reference');
  });

  it('should ignore undefined suffix', () => {
    const result = getEventName({
      eventName: EventName.QURAN_READER_TRANSLATION_REFERENCE,
      suffix: undefined,
    });
    expect(result).toBe('quran_reader_translation_reference');
  });

  it('should ignore empty string prefix', () => {
    const result = getEventName({
      eventName: EventName.QURAN_READER_BOTTOM_ACTION_SCROLLABLE,
      prefix: '',
    });
    expect(result).toBe('quran_reader_bottom_action_scrollable');
  });

  it('should ignore empty string suffix', () => {
    const result = getEventName({
      eventName: EventName.QURAN_READER_BOTTOM_ACTION_SCROLLABLE,
      suffix: '',
    });
    expect(result).toBe('quran_reader_bottom_action_scrollable');
  });

  it('should work with all event names', () => {
    Object.values(EventName).forEach((eventName) => {
      const result = getEventName({ eventName, prefix: 'pre', suffix: 'suf' });
      expect(result).toBe(`pre_${eventName}_suf`);
    });
  });
});
