import ThemeType from './ThemeType';

type ThemeTypeVariant = Exclude<ThemeType, ThemeType.Auto>;

export default ThemeTypeVariant;
