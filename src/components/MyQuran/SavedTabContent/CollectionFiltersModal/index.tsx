import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import AutocompleteMultiSelect from './AutocompleteMultiSelect';
import styles from './CollectionFiltersModal.module.scss';

import Button, { ButtonType, ButtonVariant } from '@/dls/Button/Button';
import Modal from '@/dls/Modal/Modal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  chapterItems: { value: string; label: string }[];
  juzItems: { value: string; label: string }[];
  selectedChapterIds: string[];
  selectedJuzNumbers: string[];
  onSelectedChapterIdsChange: (chapterIds: string[]) => void;
  onSelectedJuzNumbersChange: (juzNumbers: string[]) => void;
  onClearAll: () => void;
};

const CollectionFiltersModal: React.FC<Props> = ({
  isOpen,
  onClose,
  chapterItems,
  juzItems,
  selectedChapterIds,
  selectedJuzNumbers,
  onSelectedChapterIdsChange,
  onSelectedJuzNumbersChange,
  onClearAll,
}) => {
  const { t } = useTranslation('my-quran');

  return (
    <Modal
      isOpen={isOpen}
      hasCloseButton
      onClose={onClose}
      onClickOutside={onClose}
      contentClassName={styles.modalContent}
      testId="collection-filters-modal"
    >
      <Modal.Header>
        <div className={styles.headerRow}>
          <Modal.Title>{t('collections.filters.title')}</Modal.Title>
          <Button variant={ButtonVariant.Ghost} className={styles.clearButton} onClick={onClearAll}>
            {t('collections.filters.clear-all')}
          </Button>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.controls}>
          <AutocompleteMultiSelect
            id="collection-filters-chapters"
            label={t('collections.filters.chapters')}
            items={chapterItems}
            placeholder={t('collections.filters.search-chapters')}
            selectedValues={selectedChapterIds}
            onChange={onSelectedChapterIdsChange}
            emptyMessage={t('collections.filters.no-results')}
          />
          <AutocompleteMultiSelect
            id="collection-filters-juz"
            label={t('collections.filters.juz')}
            items={juzItems}
            placeholder={t('collections.filters.search-juz')}
            selectedValues={selectedJuzNumbers}
            onChange={onSelectedJuzNumbersChange}
            emptyMessage={t('collections.filters.no-results')}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className={styles.footer}>
          <Button type={ButtonType.Primary} className={styles.doneButton} onClick={onClose}>
            {t('common:done')}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default CollectionFiltersModal;
