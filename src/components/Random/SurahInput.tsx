import { useCallback, useEffect, useMemo, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './SurahInput.module.scss';

import ChapterIconContainer, {
  ChapterIconsSize,
} from '@/components/chapters/ChapterIcon/ChapterIconContainer';
import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import Input, { InputSize } from '@/dls/Forms/Input';
import Spinner from '@/dls/Spinner/Spinner';
import { toLocalizedNumber } from '@/utils/locale';

type SurahInputProps = {
  surahNumber: number;
  surahName: string;
  versesCount: number;
  description: string;
  chapterId: number;
  lastVerse?: number;
  isMinimalLayout?: boolean;
  isLoading?: boolean;
  onChangeLastVerse: (lastVerse: string) => void;
};

const SurahInput = ({
  surahName,
  surahNumber,
  versesCount,
  description,
  chapterId,
  lastVerse,
  isMinimalLayout = false,
  isLoading = false,
  onChangeLastVerse,
}: SurahInputProps) => {
  const { lang } = useTranslation('home');
  const [isChecked, setIsChecked] = useState<boolean | 'indeterminate'>(false);
  const localizedSurahNumber = useMemo(
    () => toLocalizedNumber(surahNumber, lang),
    [surahNumber, lang],
  );

  useEffect(() => {
    if (!lastVerse) setIsChecked(false);
    else if (lastVerse === versesCount) setIsChecked(true);
    else setIsChecked('indeterminate');
  }, [lastVerse, versesCount]);

  const handleCheckboxOnChange = useCallback(
    (checked: boolean) => {
      setIsChecked(checked);
      onChangeLastVerse(checked ? versesCount.toString() : '');
    },
    [versesCount, onChangeLastVerse, setIsChecked],
  );

  if (isMinimalLayout) {
    return (
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.checboxContainer}>
            <Checkbox
              id={`selection_${chapterId}`}
              checked={isChecked}
              onChange={handleCheckboxOnChange}
            />
          </div>
          <ChapterIconContainer
            chapterId={chapterId.toString()}
            hasSurahPrefix={false}
            size={ChapterIconsSize.Large}
          />
        </div>
        <div className={styles.right}>
          {description && (
            <div className={classNames(styles.description, styles.largeText)}>{description}</div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.checboxContainer}>
          <Checkbox
            id={`selection_${chapterId}`}
            checked={isChecked}
            onChange={handleCheckboxOnChange}
          />
        </div>
        <div className={styles.surahNameContainer}>
          <div className={styles.surahNumber}>{localizedSurahNumber}</div>
          <div className={styles.surahName}>{surahName}</div>
        </div>
      </div>
      {isLoading && <Spinner />}
      <div className={styles.right}>
        <Input
          id={`last_ayah_${chapterId}`}
          size={InputSize.Small}
          fixedWidth={false}
          htmlType="number"
          htmlMin={1}
          htmlMax={versesCount}
          value={lastVerse && lastVerse.toString()}
          onChange={onChangeLastVerse}
          containerClassName={styles.inputContainer}
        />
        <p>/</p>
        <p className={styles.versesCount}>{versesCount}</p>
      </div>
    </div>
  );
};

export default SurahInput;
