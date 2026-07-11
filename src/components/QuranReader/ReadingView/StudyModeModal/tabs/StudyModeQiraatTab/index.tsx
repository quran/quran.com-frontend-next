import React, { useState, useCallback, useEffect, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import useQiraatDataHook from './hooks/useQiraatData';
import JunctureTabs from './JunctureTabs';
import QiraahCardList from './QiraahCardList';
import ReadersPanel from './ReadersPanel';
import styles from './StudyModeQiraatTab.module.scss';

import Error from '@/components/Error';
import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import {
  selectStudyModeActiveTab,
  selectStudyModeIsSsrMode,
  selectStudyModeVerseKey,
} from '@/redux/slices/QuranReader/studyMode';
import { openReaderBioModal } from '@/redux/slices/QuranReader/verseActionModal';

const DEFAULT_COLOR = '#FFFFFF';

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

  // Compute reader-to-color and reader-to-reading maps for disambiguation.
  // When a reader appears in multiple readings, we assign the reader to the
  // first candidate reading whose color hasn't been used by another reader.
  // This ensures each reading gets a unique color in the Readers panel.
  const { readerColorMap, readerReadingMap } = useMemo(() => {
    const colorMap = new Map<number, string>();
    const readingMap = new Map<number, number>();
    const usedColors = new Set<string>();

    const readingsList = selectedJuncture?.readings ?? [];

    const readerCandidates = (data?.readers ?? []).map((reader) => ({
      reader,
      candidates: readingsList.filter(
        ({ matrix }) => matrix?.readers?.includes(reader.id),
      ),
    }));

    // First pass: assign unambiguous readers (single candidate)
    for (const { reader, candidates } of readerCandidates) {
      if (candidates.length === 1) {
        const color = candidates[0].color || DEFAULT_COLOR;
        colorMap.set(reader.id, color);
        readingMap.set(reader.id, candidates[0].id);
        usedColors.add(color);
      }
    }

    // Second pass: for ambiguous readers, prefer a candidate color not yet used
    for (const { reader, candidates } of readerCandidates) {
      if (candidates.length <= 1) continue;

      const unusedCandidate = candidates.find(
        ({ color }) => color && !usedColors.has(color),
      );

      const chosen = unusedCandidate || candidates[0];
      const color = chosen.color || DEFAULT_COLOR;
      colorMap.set(reader.id, color);
      readingMap.set(reader.id, chosen.id);
      usedColors.add(color);
    }

    return { readerColorMap: colorMap, readerReadingMap: readingMap };
  }, [data?.readers, selectedJuncture?.readings]);

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
   * Handles scrolling to the appropriate reading card when a transmitter is clicked.
   *
   * When a user clicks on a transmitter tag in the Readers panel, we need to scroll
   * to the corresponding reading card in the main content area. However, transmitters
   * may or may not appear directly in a reading's matrix display.
   *
   * Two-step lookup process:
   * 1. Direct match: Try to find a reading where this transmitter appears in the matrix
   * 2. Inherited match: If not found directly, find the transmitter's parent reader and
   *    scroll to a reading where that reader appears in the matrix
   *
   * This ensures users always see the relevant reading content when exploring
   * transmitter-reader relationships.
   *
   * @param transmitterId - The ID of the clicked transmitter
   */
  const handleTransmitterClick = useCallback(
    (transmitterId: number) => {
      if (!selectedJuncture?.readings) return undefined;

      // Helper function to scroll to a reading card by ID
      const scrollToReading = (readingId: number): void => {
        const cardElement = document.getElementById(`qiraat-card-${readingId}`);
        cardElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };

      // 1. Try to find a reading where this transmitter appears directly in the matrix
      const directReading = selectedJuncture.readings.find((reading) =>
        reading.matrix?.transmitters?.includes(transmitterId),
      );

      if (directReading) return scrollToReading(directReading.id);

      // 2. If not found directly, find the transmitter's parent reader
      const transmitter = data?.transmitters?.find((tr) => tr.id === transmitterId);
      if (!transmitter) return undefined;

      // 3. Use the same disambiguation result as the color assignment, so the
      //    scroll target matches the reader's color in the Readers panel.
      const readingId = readerReadingMap.get(transmitter.readerId);
      if (readingId) {
        scrollToReading(readingId);
      }
      return undefined;
    },
    [selectedJuncture?.readings, data?.transmitters, readerReadingMap],
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
            readerColorMap={readerColorMap}
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
