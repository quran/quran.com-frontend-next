import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import SearchIcon from '../../../public/icons/search.svg';
import Input from '../dls/Forms/Input';

import styles from './QuranReciterListHero.module.scss';

type QuranReciterListHeroProps = {
  searchQuery: string;
  onSearchQueryChange: (newSearchQuery: string) => void;
};
const QuranReciterListHero = ({ onSearchQueryChange, searchQuery }: QuranReciterListHeroProps) => {
  const { t } = useTranslation();
  return (
    <div className={classNames(styles.container)}>
      <div className={styles.backgroundImage} />
      <div className={styles.title}>{t('reciter:quran-reciters')}</div>

      <div className={styles.searchInputContainer}>
        <Input
          prefix={<SearchIcon />}
          id="translations-search"
          value={searchQuery}
          onChange={onSearchQueryChange}
          placeholder={t('common:settings.search-reciter')}
          fixedWidth={false}
          shouldFlipOnRTL
        />
      </div>
    </div>
  );
};

export default QuranReciterListHero;
