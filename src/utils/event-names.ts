enum EventName {
  TOP_BANNER_BEYOND_RAMADAN = 'top_banner_beyond_ramadan',
  QURAN_READER_BOTTOM_ACTION_SCROLLABLE = 'quran_reader_bottom_action_scrollable',
  QURAN_READER_STUDY_MODE_BOTTOM_ACTION_SCROLLABLE = 'quran_reader_study_mode_bottom_action_scrollable',
  QURAN_READER_END_OF_SURAH_CTA = 'quran_reader_end_of_surah_cta',
  QURAN_READER_PINNED_VERSES_SCROLLABLE = 'quran_reader_pinned_verses_scrollable',
  QURAN_READER_TRANSLATION_REFERENCE = 'quran_reader_translation_reference',
  QURAN_READER_STUDY_MODE_REFLECTIONS_EBOOK_BANNER = 'quran_reader_study_mode_reflections_ebook_banner',
  QURAN_READER_STUDY_MODE_LESSONS_EBOOK_BANNER = 'quran_reader_study_mode_lessons_ebook_banner',
  QURAN_READER_STUDY_MODE_CHAPTER_BANNER = 'quran_reader_study_mode_chapter_banner',
  HOMEPAGE_EBOOK_BANNER = 'homepage_ebook_banner',
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
