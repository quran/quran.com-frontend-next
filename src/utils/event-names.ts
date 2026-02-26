enum EventName {
  QURAN_READER_BOTTOM_ACTION_SCROLLABLE = 'quran_reader_bottom_action_scrollable',
  QURAN_READER_STUDY_MODE_BOTTOM_ACTION_SCROLLABLE = 'quran_reader_study_mode_bottom_action_scrollable',
  QURAN_READER_END_OF_SURAH_CTA = 'quran_reader_end_of_surah_cta',
  QURAN_READER_PINNED_VERSES_SCROLLABLE = 'quran_reader_pinned_verses_scrollable',
  QURAN_READER_TRANSLATION_REFERENCE = 'quran_reader_translation_reference',
}

interface EventNameParams {
  eventName: EventName;
  prefix?: string;
  suffix?: string;
}

export const getEventName = ({ eventName, prefix, suffix }: EventNameParams): string => {
  return [prefix, eventName, suffix].filter(Boolean).join('_');
};

export default EventName;
