import React, { useState, useCallback, useEffect, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import useQiraatDataHook from './hooks/useQiraatData';
import JunctureTabs from './JunctureTabs';
import QiraahCardList from './QiraahCardList';
import QiraatBanner from './QiraatBanner';
import ReadersPanel from './ReadersPanel';
import ReaderBioModal from './ReadersPanel/ReaderBioModal';
import styles from './StudyModeQiraatTab.module.scss';

import Spinner from '@/dls/Spinner/Spinner';
import { QiraatReader } from '@/types/Qiraat';

interface StudyModeQiraatTabProps {
  chapterId: string;
  verseNumber: string;
}

/**
 * Main container component for the Qiraat tab in Study Mode.
 * Orchestrates all Qiraat components and manages state.
 * @returns {JSX.Element} Rendered Qiraat tab UI
 */
const StudyModeQiraatTab: React.FC<StudyModeQiraatTabProps> = ({ chapterId, verseNumber }) => {
  const { t } = useTranslation('common');
  const verseKey = `${chapterId}:${verseNumber}`;

  const { data, isLoading, error, hasData } = useQiraatDataHook(verseKey);

  const [selectedJunctureId, setSelectedJunctureId] = useState<number | null>(
    data?.junctures?.[0]?.id ?? null,
  );

  const [isReadersPanelExpanded, setIsReadersPanelExpanded] = useState(false);
  const [bioModalReaderId, setBioModalReaderId] = useState<number | null>(null);

  // Set first juncture as selected when data loads
  useEffect(() => {
    if (data?.junctures && data.junctures.length > 0 && selectedJunctureId === null) {
      setSelectedJunctureId(data.junctures[0].id);
    }
  }, [data?.junctures, selectedJunctureId]);

  // Get selected juncture's readings
  const selectedJuncture = useMemo(() => {
    if (!data?.junctures || !selectedJunctureId) return null;
    return data.junctures.find((juncture) => juncture.id === selectedJunctureId) ?? null;
  }, [data?.junctures, selectedJunctureId]);

  // Get reader for bio modal
  const bioModalReader: QiraatReader | null = useMemo(() => {
    if (!data?.readers || !bioModalReaderId) return null;
    return data.readers.find((reader) => reader.id === bioModalReaderId) ?? null;
  }, [data?.readers, bioModalReaderId]);

  // Handlers
  const handleJunctureSelect = useCallback((junctureId: number) => {
    setSelectedJunctureId(junctureId);
  }, []);

  const handleToggleReadersPanel = useCallback(() => {
    setIsReadersPanelExpanded((prev) => !prev);
  }, []);

  const handleReaderInfoClick = useCallback((readerId: number) => {
    setBioModalReaderId(readerId);
  }, []);

  const handleCloseBioModal = useCallback(() => {
    setBioModalReaderId(null);
  }, []);

  const handleTransmitterClick = useCallback(
    (transmitterId: number) => {
      // Find which reading this transmitter belongs to and scroll to it
      if (!selectedJuncture?.readings) return;

      const readingToScrollTo = selectedJuncture.readings.find(
        (reading) =>
          reading.matrix?.transmitters?.includes(transmitterId) ||
          reading.matrix?.readers?.some((readerId) =>
            data?.transmitters?.some(
              (transmitter) =>
                transmitter.id === transmitterId && transmitter.readerId === readerId,
            ),
          ),
      );

      if (readingToScrollTo) {
        const cardElement = document.getElementById(`qiraah-card-${readingToScrollTo.id}`);
        if (cardElement) cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    [selectedJuncture?.readings, data?.transmitters],
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{t('error.general')}</p>
      </div>
    );
  }

  // No data state
  if (!hasData || !data) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyText}>{t('qiraat.no-junctures')}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <QiraatBanner />

      <JunctureTabs
        junctures={data.junctures}
        selectedJunctureId={selectedJunctureId}
        onJunctureSelect={handleJunctureSelect}
      />

      {/* Main content */}
      <div className={styles.content}>
        {/* Readers panel (right side on desktop, top on mobile) */}
        <div className={styles.readersContainer}>
          <ReadersPanel
            readers={data.readers}
            transmitters={data.transmitters}
            readings={selectedJuncture?.readings || []}
            isExpanded={isReadersPanelExpanded}
            onToggleExpand={handleToggleReadersPanel}
            onTransmitterClick={handleTransmitterClick}
            onReaderInfoClick={handleReaderInfoClick}
          />
        </div>

        {/* Left content area */}
        <div className={styles.mainContent}>
          {/* Juncture tabs */}

          {/* Qiraah cards */}
          {selectedJuncture && (
            <QiraahCardList
              readings={selectedJuncture.readings}
              readers={data.readers}
              transmitters={data.transmitters}
            />
          )}

          {/* Combined explanation if exists */}
          {selectedJuncture?.commentary && (
            <div className={styles.commentarySection}>
              <h3 className={styles.commentaryTitle}>{t('qiraat.combined-explanation')}</h3>
              <p className={styles.commentaryText}>{selectedJuncture.commentary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reader bio modal */}
      <ReaderBioModal
        reader={bioModalReader}
        isOpen={bioModalReaderId !== null}
        onClose={handleCloseBioModal}
      />
    </div>
  );
};

export default StudyModeQiraatTab;
