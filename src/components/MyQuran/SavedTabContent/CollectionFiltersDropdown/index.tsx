/* eslint-disable max-lines */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import * as PrimitiveDropdownMenu from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './CollectionFiltersDropdown.module.scss';

import PopoverMenu, {
  PopoverMenuAlign,
  PopoverMenuExpandDirection,
} from '@/dls/PopoverMenu/PopoverMenu';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import SearchIcon from '@/icons/search.svg';
import { isRTLLocale } from '@/utils/locale';

type FilterItem = {
  value: string;
  label: string;
  searchText: string;
};

export type CollectionFiltersDropdownProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  chapterItems: FilterItem[];
  juzItems: FilterItem[];
  selectedChapterIds: string[];
  selectedJuzNumbers: string[];
  onSelectedChapterIdsChange: (chapterIds: string[]) => void;
  onSelectedJuzNumbersChange: (juzNumbers: string[]) => void;
};

type View = 'root' | 'chapter' | 'juz';

const buildNextSelectedValues = (current: string[], value: string) => {
  const set = new Set(current);
  if (set.has(value)) set.delete(value);
  else set.add(value);
  return Array.from(set).sort((a, b) => Number(a) - Number(b));
};

const CollectionFiltersDropdown: React.FC<CollectionFiltersDropdownProps> = ({
  isOpen,
  onOpenChange,
  trigger,
  chapterItems,
  juzItems,
  selectedChapterIds,
  selectedJuzNumbers,
  onSelectedChapterIdsChange,
  onSelectedJuzNumbersChange,
}) => {
  const { t, lang } = useTranslation('my-quran');
  const { t: tCommon } = useTranslation('common');
  const isRtl = isRTLLocale(lang);
  const NextChevronIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon;
  const BackChevronIcon = isRtl ? ChevronRightIcon : ChevronLeftIcon;

  const [view, setView] = useState<View>('root');
  const [chapterQuery, setChapterQuery] = useState('');
  const [juzQuery, setJuzQuery] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setView('root');
      setChapterQuery('');
      setJuzQuery('');
    }
  }, [isOpen]);

  const selectedChapterSet = useMemo(() => new Set(selectedChapterIds), [selectedChapterIds]);
  const selectedJuzSet = useMemo(() => new Set(selectedJuzNumbers), [selectedJuzNumbers]);

  const filteredChapterItems = useMemo(() => {
    const q = chapterQuery.trim().toLowerCase();
    if (!q) return chapterItems;
    return chapterItems.filter((item) => item.searchText.includes(q));
  }, [chapterItems, chapterQuery]);

  const filteredJuzItems = useMemo(() => {
    const q = juzQuery.trim().toLowerCase();
    if (!q) return juzItems;
    return juzItems.filter((item) => item.searchText.includes(q));
  }, [juzItems, juzQuery]);

  const onToggleChapter = useCallback(
    (value: string) => {
      onSelectedChapterIdsChange(buildNextSelectedValues(selectedChapterIds, value));
    },
    [onSelectedChapterIdsChange, selectedChapterIds],
  );

  const onToggleJuz = useCallback(
    (value: string) => {
      onSelectedJuzNumbersChange(buildNextSelectedValues(selectedJuzNumbers, value));
    },
    [onSelectedJuzNumbersChange, selectedJuzNumbers],
  );

  const renderRoot = () => (
    <div className={styles.panel} data-view="root" aria-label={t('collections.filters.title')}>
      <button
        type="button"
        className={styles.rootRow}
        onClick={() => setView('chapter')}
        aria-label={t('collections.filters.chapters')}
      >
        <span className={styles.rootRowText}>{t('collections.filters.chapters')}</span>
        <NextChevronIcon className={styles.chevron} />
      </button>
      <button
        type="button"
        className={styles.rootRow}
        onClick={() => setView('juz')}
        aria-label={t('collections.filters.juz')}
      >
        <span className={styles.rootRowText}>{t('collections.filters.juz')}</span>
        <NextChevronIcon className={styles.chevron} />
      </button>
    </div>
  );

  const renderListView = (opts: {
    title: string;
    query: string;
    setQuery: (v: string) => void;
    items: FilterItem[];
    selectedSet: Set<string>;
    onToggle: (v: string) => void;
  }) => {
    return (
      <div className={styles.panel} data-view={view} aria-label={opts.title}>
        <button
          type="button"
          className={styles.backRow}
          onClick={() => setView('root')}
          aria-label={tCommon('back')}
        >
          <BackChevronIcon className={styles.backChevron} />
          <span className={styles.backText}>{opts.title}</span>
        </button>

        <div className={styles.searchBox}>
          <div className={styles.searchInner}>
            <SearchIcon className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder={tCommon('search.title')}
              value={opts.query}
              onChange={(e) => opts.setQuery(e.target.value)}
              aria-label={tCommon('search.title')}
            />
          </div>
        </div>

        <div className={styles.options} aria-label={opts.title}>
          {opts.items.length === 0 ? (
            <div className={styles.emptyRow}>{t('collections.filters.no-results')}</div>
          ) : (
            opts.items.map((item) => {
              const isSelected = opts.selectedSet.has(item.value);
              return (
                <PrimitiveDropdownMenu.Item key={item.value} asChild>
                  <button
                    type="button"
                    className={classNames(styles.optionRow, isSelected && styles.optionRowSelected)}
                    onClick={() => opts.onToggle(item.value)}
                    aria-pressed={isSelected}
                  >
                    <span className={styles.optionLabel}>{item.label}</span>
                  </button>
                </PrimitiveDropdownMenu.Item>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <PopoverMenu
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      trigger={trigger}
      isPortalled={false}
      isModal={false}
      expandDirection={PopoverMenuExpandDirection.BOTTOM}
      align={PopoverMenuAlign.END}
      sideOffset={6}
      contentClassName={styles.popoverContent}
      shouldClose
    >
      {view === 'root' && renderRoot()}
      {view === 'chapter' &&
        renderListView({
          title: t('collections.filters.chapters'),
          query: chapterQuery,
          setQuery: setChapterQuery,
          items: filteredChapterItems,
          selectedSet: selectedChapterSet,
          onToggle: onToggleChapter,
        })}
      {view === 'juz' &&
        renderListView({
          title: t('collections.filters.juz'),
          query: juzQuery,
          setQuery: setJuzQuery,
          items: filteredJuzItems,
          selectedSet: selectedJuzSet,
          onToggle: onToggleJuz,
        })}
    </PopoverMenu>
  );
};

export default CollectionFiltersDropdown;
