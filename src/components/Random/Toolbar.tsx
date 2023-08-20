import { useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './Toolbar.module.scss';

import ChapterIconContainer, {
  ChapterIconsSize,
} from '@/components/chapters/ChapterIcon/ChapterIconContainer';
import Button, { ButtonType } from '@/dls/Button/Button';
import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import Input, { InputSize } from '@/dls/Forms/Input';
import Spinner from '@/dls/Spinner/Spinner';
import Toggle from '@/dls/Toggle/Toggle';
import { toLocalizedNumber } from '@/utils/locale';

type SurahInputProps = {
  surahNumber: number;
  surahName: string;
  versesCount: number;
  description: string;
  chapterId: number;
  isMinimalLayout?: boolean;
  isLoading?: boolean;
};

const Toolbar = () => {
  const { t } = useTranslation('random');

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <Checkbox
          id="selectAll"
          onChange={console.log}
          checked="indeterminate"
          label="5 surahs selected"
        />
      </div>
      <div className={styles.right}>
        <Button type={ButtonType.Secondary}>{t('load-previous')}</Button>
        <Button type={ButtonType.Primary}>{t('save-randomize')}</Button>
      </div>
    </div>
  );
};

export default Toolbar;
