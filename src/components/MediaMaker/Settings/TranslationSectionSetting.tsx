import { useCallback, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '../MediaMaker.module.scss';

import TranslationSettings from './TranslationSetting';

import DataFetcher from '@/components/DataFetcher';
import Section from '@/components/Navbar/SettingsDrawer/Section';
import Modal from '@/dls/Modal/Modal';
import SelectionCard from '@/dls/SelectionCard/SelectionCard';
import Skeleton from '@/dls/Skeleton/Skeleton';
import { MediaSettingsProps } from '@/types/Media/MediaSettings';
import { makeTranslationsUrl } from '@/utils/apiPaths';
import { toLocalizedNumber } from '@/utils/locale';
import { TranslationsResponse } from 'types/ApiResponses';

interface Props extends MediaSettingsProps {
  translations: number[];
}

const TranslationSettingsSection: React.FC<Props> = ({ onSettingsUpdate, translations }) => {
  const { t, lang } = useTranslation('common');
  const [showTranslationsList, setShowTranslationsList] = useState(false);

  const translationLoading = useCallback(
    () => (
      <div>
        {translations.map((id) => (
          <Skeleton className={styles.skeleton} key={id} />
        ))}
      </div>
    ),
    [translations],
  );

  const localizedSelectedTranslations = useMemo(
    () => toLocalizedNumber(translations.length - 1, lang),
    [translations, lang],
  );

  const onSelectionCardClicked = useCallback(() => {
    setShowTranslationsList(!showTranslationsList);
  }, [setShowTranslationsList, showTranslationsList]);

  const renderTranslations = useCallback(
    (data: TranslationsResponse) => {
      if (!data) {
        return null;
      }
      const firstSelectedTranslation = data.translations.find(
        (translation) => translation.id === translations[0],
      );

      let selectedValueString = t('settings.no-translation-selected');
      if (translations.length === 1) selectedValueString = firstSelectedTranslation?.name;
      if (translations.length === 2) {
        selectedValueString = t('settings.value-and-other', {
          value: firstSelectedTranslation?.name,
          othersCount: localizedSelectedTranslations,
        });
      }
      if (translations.length > 2) {
        selectedValueString = t('settings.value-and-others', {
          value: firstSelectedTranslation?.name,
          othersCount: localizedSelectedTranslations,
        });
      }

      return (
        <SelectionCard
          label={t('settings.selected-translations')}
          value={selectedValueString}
          onClick={onSelectionCardClicked}
        />
      );
    },
    [localizedSelectedTranslations, onSelectionCardClicked, translations, t],
  );

  const clearTranslations = () => {
    onSettingsUpdate({ translations: [] }, 'translations', []);
  };

  return (
    <>
      <div className={styles.section}>
        <h1 className={styles.sectionTitle}>{t('translations')}</h1>
        <Section.Row>
          <DataFetcher
            loading={translationLoading}
            queryKey={makeTranslationsUrl(lang)}
            render={renderTranslations}
          />
        </Section.Row>
      </div>
      {showTranslationsList ? (
        <div className={styles.translationModalWrapper}>
          <Modal
            isOpen
            onClickOutside={onSelectionCardClicked}
            onEscapeKeyDown={onSelectionCardClicked}
          >
            <Modal.Body>
              <Modal.Header>
                <Modal.Title>{t('translations')}</Modal.Title>
                <div className={styles.translationListContainer}>
                  <TranslationSettings
                    onSettingsUpdate={onSettingsUpdate}
                    selectedTranslations={translations}
                  />
                </div>
              </Modal.Header>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Action onClick={clearTranslations}>{t('media:deselect')}</Modal.Action>
              <Modal.CloseAction onClick={onSelectionCardClicked}>{t('close')}</Modal.CloseAction>
            </Modal.Footer>
          </Modal>
        </div>
      ) : null}
    </>
  );
};
export default TranslationSettingsSection;
