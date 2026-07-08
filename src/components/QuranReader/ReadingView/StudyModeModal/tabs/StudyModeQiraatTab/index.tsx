import React, { useState, useCallback, useEffect, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import useQiraatDataHook from './hooks/useQiraatData';
import JunctureTabs from './JunctureTabs';
import QiraahCardList from './QiraahCardList';
import ReadersPanel from './ReadersPanel';
import styles from './StudyModeQiraatTab.module.scss';
import { buildTransmitterReadingAssignments } from './utils/transmitterReadingAssignments';

import Error from '@/components/Error';
import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import {
  selectStudyModeActiveTab,
  selectStudyModeIsSsrMode,
  selectStudyModeVerseKey,
} from '@/redux/slices/QuranReader/studyMode';
import { openReaderBioModal } from '@/redux/slices/QuranReader/verseActionModal';

interface StudyModeQiraatTabProps {
  chapterId: string;
  verseNumber: string;
  switchTab?: (tabId: StudyModeTabId | null) => void;
}

/**
 * Main container component for the Qiraat tab in Study Mode.
 * Orchestrates all Qiraat components and manages state.
 * @returns {JSX.Element} Rendered Qiraat tab UI
 */
const StudyModeQiraatTab: React.FC<StudyModeQiraatTabProps> = ({
  chapterId,
  verseNumber,
  switchTab,
}) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const verseKey = `${chapterId}:${verseNumber}`;

  const { data, isLoading, error, hasData, refetch } = useQiraatDataHook(verseKey);

  const [selectedJunctureId, setSelectedJunctureId] = useState<number | null>(
    data?.junctures?.[0]?.id ?? null,
  );

  const [isReadersPanelExpanded, setIsReadersPanelExpanded] = useState(false);

  // Get Study Mode state for restoration
  const activeTab = useSelector(selectStudyModeActiveTab);
  const studyModeVerseKey = useSelector(selectStudyModeVerseKey);
  const isSsrMode = useSelector(selectStudyModeIsSsrMode);

  // Set first juncture as selected when data loads
  useEffect(() => {
    if (data?.junctures && data.junctures.length > 0 && selectedJunctureId === null) {
      setSelectedJunctureId(data.junctures[0].id);
    }
  }, [data?.junctures, selectedJunctureId]);

  // Auto-close tab when there are no qiraat
  useEffect(() => {
    if (!isLoading && !hasData && switchTab) switchTab(null);
  }, [isLoading, hasData, switchTab]);

  // Get selected juncture's readings
  const selectedJuncture = useMemo(() => {
    if (!data?.junctures || !selectedJunctureId) return null;
    return data.junctures.find((juncture) => juncture.id === selectedJunctureId) ?? null;
  }, [data?.junctures, selectedJunctureId]);

  // Handlers
  const handleJunctureSelect = useCallback((junctureId: number) => {
    setSelectedJunctureId(junctureId);
  }, []);

  const handleToggleReadersPanel = useCallback(() => {
    setIsReadersPanelExpanded((prev) => !prev);
  }, []);

  const handleReaderInfoClick = useCallback(
    (readerId: number) => {
      const selectedReader = data?.readers.find((reader) => reader.id === readerId);
      if (!selectedReader) return;

      dispatch(
        openReaderBioModal({
          reader: selectedReader,
          verseKey,
          wasOpenedFromStudyMode: true,
          studyModeRestoreState: {
            verseKey: studyModeVerseKey || verseKey,
            activeTab,
            highlightedWordLocation: null,
            isSsrMode,
          },
        }),
      );
    },
    [data?.readers, dispatch, verseKey, studyModeVerseKey, activeTab, isSsrMode],
  );

  /**
   * Reading assignment (reading id + color) per transmitter tag for the selected
   * juncture. Computed panel-wide so overlapping reader-level mappings resolve to
   * distinct reading colors (#3286), and shared with the transmitter click handler
   * so the tag color and the card it scrolls to always agree.
   */
  const transmitterAssignments = useMemo(
    () =>
      buildTransmitterReadingAssignments(
        data?.readers ?? [],
        data?.transmitters ?? [],
        selectedJuncture?.readings ?? [],
      ),
    [data?.readers, data?.transmitters, selectedJuncture?.readings],
  );

  /**
   * Handles scrolling to the appropriate reading card when a transmitter is clicked.
   *
   * Scrolls to the reading the transmitter's tag is color-coded with (the assignment
   * computed by buildTransmitterReadingAssignments), so the clicked tag and the
   * highlighted card always match.
   *
   * @param transmitterId - The ID of the clicked transmitter
   */
  const handleTransmitterClick = useCallback(
    (transmitterId: number) => {
      const readingId = transmitterAssignments.get(transmitterId)?.readingId;
      if (readingId === null || readingId === undefined) return;

      const cardElement = document.getElementById(`qiraat-card-${readingId}`);
      cardElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    [transmitterAssignments],
  );

  if (isLoading) {
    return (
      <div className={classNames(styles.edgeToEdge, styles.container)}>
        <TafsirSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={classNames(styles.edgeToEdge, styles.errorContainer, styles.container)}>
        <Error error={error} onRetryClicked={refetch} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 
        TODO: Uncomment this when we have a qiraat learning plan 
        <QiraatBanner /> 
      */}

      <JunctureTabs
        junctures={data?.junctures || []}
        selectedJunctureId={selectedJunctureId}
        onJunctureSelect={handleJunctureSelect}
      />

      <div className={styles.content}>
        {/* Readers panel (right side on desktop, top on mobile) */}
        <div className={styles.readersContainer}>
          <ReadersPanel
            readers={data.readers}
            transmitters={data.transmitters}
            readings={selectedJuncture?.readings || []}
            transmitterAssignments={transmitterAssignments}
            isExpanded={isReadersPanelExpanded}
            onToggleExpand={handleToggleReadersPanel}
            onTransmitterClick={handleTransmitterClick}
            onReaderInfoClick={handleReaderInfoClick}
          />
        </div>

        <div className={styles.mainContent}>
          <div className={styles.readingsHeader}>{t('quran-reader:qiraat.readings')}:</div>
          {selectedJuncture && <QiraahCardList readings={selectedJuncture.readings} />}

          {selectedJuncture?.commentary && (
            <div className={styles.commentarySection}>
              <h3 className={styles.commentaryTitle}>{t('quran-reader:qiraat.explanation')}</h3>
              <p className={styles.commentaryText}>{selectedJuncture.commentary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyModeQiraatTab;
