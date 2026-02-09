import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ActiveFiltersChips.module.scss';

import CloseIcon from '@/icons/close.svg';

export type ActiveFilterChip = {
  id: string;
  label: string;
};

type Props = {
  chapters: ActiveFilterChip[];
  juz: ActiveFilterChip[];
  onRemoveChapter: (chapterId: string) => void;
  onRemoveJuz: (juzNumber: string) => void;
  onClearAll: () => void;
};

const ActiveFiltersChips: React.FC<Props> = ({
  chapters,
  juz,
  onRemoveChapter,
  onRemoveJuz,
  onClearAll,
}) => {
  const { t } = useTranslation('my-quran');

  const hasAny = chapters.length > 0 || juz.length > 0;
  if (!hasAny) return null;

  return (
    <div className={styles.container} data-testid="collection-active-filters">
      <div className={styles.chips}>
        {chapters.map((chip) => (
          <button
            key={`chapter-${chip.id}`}
            type="button"
            className={styles.chip}
            onClick={() => onRemoveChapter(chip.id)}
          >
            <span className={styles.chipLabel}>{chip.label}</span>
            <CloseIcon className={styles.removeIcon} />
          </button>
        ))}
        {juz.map((chip) => (
          <button
            key={`juz-${chip.id}`}
            type="button"
            className={styles.chip}
            onClick={() => onRemoveJuz(chip.id)}
          >
            <span className={styles.chipLabel}>{chip.label}</span>
            <CloseIcon className={styles.removeIcon} />
          </button>
        ))}
      </div>
      <button type="button" className={styles.clearAll} onClick={onClearAll}>
        {t('collections.filters.clear-all')}
      </button>
    </div>
  );
};

export default ActiveFiltersChips;
