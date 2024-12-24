const BASE_OG_URL = 'https://og.qurancdn.com';

interface BaseOgOptions {
  locale: string;
}

export const getDefaultOgImageUrl = ({ locale }: BaseOgOptions) =>
  `${BASE_OG_URL}/api/og?lang=${locale}`;

export const getAboutTheQuranImageUrl = ({ locale }: BaseOgOptions) =>
  `${BASE_OG_URL}/api/og/about-the-quran?lang=${locale}`;

export const getLearningPlansImageUrl = ({ locale }: BaseOgOptions) =>
  `${BASE_OG_URL}/api/og/learning-plans?lang=${locale}`;

export const getMediaGeneratorOgImageUrl = ({ locale }: BaseOgOptions) =>
  `${BASE_OG_URL}/api/og/media?lang=${locale}`;

export const getChapterOgImageUrl = ({
  chapterId,
  locale,
  verseNumber,
}: BaseOgOptions & {
  chapterId: string | number;
  verseNumber?: string | number;
}) => {
  const url = `${BASE_OG_URL}/api/og/chapter/${chapterId}?lang=${locale}`;

  if (!verseNumber) return url;
  return `${url}&verse=${verseNumber}`;
};
