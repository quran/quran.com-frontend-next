import NavigateToIcon from '@/icons/east.svg';
import ArabicIcon from '@/icons/search/arabic.svg';
import AyahRangeIcon from '@/icons/search/ayah-range.svg';
import JuzIcon from '@/icons/search/juz.svg';
import PageIcon from '@/icons/search/page.svg';
import SurahIcon from '@/icons/search/surah.svg';
import TranslationIcon from '@/icons/search/translation.svg';
import TransliterationIcon from '@/icons/search/transliteration.svg';
import SearchIcon from '@/icons/search.svg';
import { SearchNavigationType } from '@/types/Search/SearchNavigationResult';

const TYPE_ICON_MAP = {
  [SearchNavigationType.AYAH]: ArabicIcon,
  [SearchNavigationType.SURAH]: SurahIcon,
  [SearchNavigationType.JUZ]: JuzIcon,
  [SearchNavigationType.PAGE]: PageIcon,
  [SearchNavigationType.RANGE]: AyahRangeIcon,
  // TODO: change this after it's ready
  [SearchNavigationType.RUB_EL_HIZB]: ArabicIcon,
  // TODO: change this after it's ready
  [SearchNavigationType.HIZB]: ArabicIcon,
  [SearchNavigationType.SEARCH_PAGE]: SearchIcon,
  [SearchNavigationType.TRANSLITERATION]: TransliterationIcon,
  [SearchNavigationType.TRANSLATION]: TranslationIcon,
};

interface Props {
  type: SearchNavigationType;
}

const SearchResultItemIcon = ({ type }: Props) => {
  const Icon = TYPE_ICON_MAP[type];
  if (!type) {
    return <></>;
  }

  return Icon ? <Icon /> : <NavigateToIcon />;
};

export default SearchResultItemIcon;
