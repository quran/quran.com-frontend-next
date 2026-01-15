import { useCallback, useContext } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from './ReciterSection.module.scss';
import Section from './Section';
import translationStyles from './TranslationSection.module.scss';

import DataFetcher from '@/components/DataFetcher';
import SelectionCard from '@/dls/SelectionCard/SelectionCard';
import Skeleton from '@/dls/Skeleton/Skeleton';
import { setSettingsView, SettingsView } from '@/redux/slices/navbar';
import { makeAvailableRecitersUrl } from '@/utils/apiPaths';
import { logValueChange } from '@/utils/eventLogger';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import { RecitersResponse } from 'types/ApiResponses';
import Reciter from 'types/Reciter';

const DEFAULT_RECITATION_STYLE = 'Murattal';

const ReciterSection = () => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();

  const audioService = useContext(AudioPlayerMachineContext);
  const selectedReciterId = useSelector(audioService, (state) => state.context.reciterId);

  const reciterLoading = useCallback(
    () => (
      <div>
        <Skeleton className={translationStyles.skeleton} />
      </div>
    ),
    [],
  );

  const onSelectionCardClicked = useCallback(() => {
    dispatch(setSettingsView(SettingsView.Reciter));
    logValueChange('settings_view', SettingsView.Reciter, SettingsView.Body);
  }, [dispatch]);

  const renderReciter = useCallback(
    (data: RecitersResponse) => {
      const selectedReciter = data.reciters?.find(
        (reciter: Reciter) => reciter.id === selectedReciterId,
      );

      let selectedValueString = t('audio.select-reciter');
      if (selectedReciter) {
        const styleName = selectedReciter?.style?.name ?? DEFAULT_RECITATION_STYLE;
        const translatedName = selectedReciter?.translatedName?.name ?? t('audio.unknown-reciter');
        selectedValueString =
          styleName !== DEFAULT_RECITATION_STYLE
            ? `${translatedName} - ${styleName}`
            : translatedName;
      }

      return (
        <SelectionCard
          label={t('settings.selected-reciter')}
          value={selectedValueString}
          onClick={onSelectionCardClicked}
          className={styles.reciterSelectionCard}
          valueClassName={styles.reciterValue}
        />
      );
    },
    [onSelectionCardClicked, selectedReciterId, t],
  );

  return (
    <Section id="reciter-section" hideSeparator>
      <Section.Row>
        <DataFetcher
          loading={reciterLoading}
          queryKey={makeAvailableRecitersUrl(lang)}
          render={renderReciter}
        />
      </Section.Row>
    </Section>
  );
};

export default ReciterSection;
