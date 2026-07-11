import React, { useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import colorStyles from '../color.module.scss';
import { getColorClass } from '../utils/color';

import ReaderItem from './ReaderItem';
import styles from './ReadersPanel.module.scss';

import ChevronDownIcon from '@/icons/chevron-down.svg';
import { QiraatReader, QiraatTransmitter, QiraatReading } from '@/types/Qiraat';

interface ReadersPanelProps {
  readers: QiraatReader[];
  transmitters: QiraatTransmitter[];
  readings: QiraatReading[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onTransmitterClick?: (transmitterId: number) => void;
  onReaderInfoClick?: (readerId: number) => void;
}

const DEFAULT_COLOR = '#FFFFFF';

/**
 * Responsive panel displaying all canonical readers with their transmitters.
 * Desktop: Always visible as a side panel.
 * Mobile: Collapsible, collapsed by default.
 * @returns {JSX.Element} Rendered ReadersPanel component
 */
const ReadersPanel: React.FC<ReadersPanelProps> = ({
  readers,
  transmitters,
  readings,
  isExpanded,
  onToggleExpand,
  onTransmitterClick,
  onReaderInfoClick,
}) => {
  const { t } = useTranslation('common');

  // Sort readers by position (canonical order)
  const sortedReaders = useMemo(
    () => [...readers].sort((a, b) => a.position - b.position),
    [readers],
  );

  const readingColors = useMemo(
    () =>
      readings
        .map((reading) => reading.color)
        .filter((color) => color !== null)
        .map((color) => (
          <div
            key={color}
            className={classNames(styles.readingColor, colorStyles[getColorClass(color)])}
          />
        )),
    [readings],
  );

  const readerColorMap = useMemo(() => {
    const map = new Map<number, string>();
    const usedColors = new Set<string>();

    const readerCandidates = readers.map((reader) => ({
      reader,
      candidates: readings.filter(
        ({ matrix }) => matrix?.readers?.includes(reader.id),
      ),
    }));

    // First pass: assign unambiguous readers (single candidate)
    for (const { reader, candidates } of readerCandidates) {
      if (candidates.length === 1) {
        const color = candidates[0].color || DEFAULT_COLOR;
        map.set(reader.id, color);
        usedColors.add(color);
      }
    }

    // Second pass: for ambiguous readers, prefer a candidate color not yet used
    for (const { reader, candidates } of readerCandidates) {
      if (candidates.length <= 1) continue;

      const unusedCandidate = candidates.find(
        ({ color }) => color && !usedColors.has(color),
      );

      if (unusedCandidate) {
        const color = unusedCandidate.color || DEFAULT_COLOR;
        map.set(reader.id, color);
        usedColors.add(color);
      } else {
        const color = candidates[0].color || DEFAULT_COLOR;
        map.set(reader.id, color);
      }
    }

    return map;
  }, [readers, readings]);

  return (
    <div className={classNames(styles.panel, { [styles.expanded]: isExpanded })}>
      {/* Mobile header with toggle */}
      <button
        type="button"
        className={classNames(styles.header, styles.mobile)}
        onClick={onToggleExpand}
        aria-expanded={isExpanded}
        aria-controls="readers-list"
        data-readers-header
      >
        <div className={styles.headerTitleContainer}>
          <span className={styles.headerTitle}>{t('quran-reader:qiraat.readers')}</span>
          <span className={styles.readingColors}>{readingColors}</span>
        </div>
        <ChevronDownIcon
          className={classNames(styles.chevron, {
            [styles.chevronRotated]: isExpanded,
          })}
        />
      </button>

      {/* Desktop header */}
      <div className={classNames(styles.header, styles.desktop)} data-readers-header>
        <span className={styles.headerTitle}>{t('quran-reader:qiraat.readers')}</span>
        <span className={styles.readingColors}>{readingColors}</span>
      </div>

      {/* Reader list - always visible on desktop, collapsible on mobile */}
      <div
        id="readers-list"
        data-readers-list
        className={classNames(styles.readersList, {
          [styles.readersListVisible]: isExpanded,
        })}
      >
        {sortedReaders.map((reader) => (
          <ReaderItem
            key={reader.id}
            reader={reader}
            transmitters={transmitters}
            readings={readings}
            readerColor={readerColorMap.get(reader.id)}
            onInfoClick={() => onReaderInfoClick?.(reader.id)}
            onTransmitterClick={onTransmitterClick}
            isClickable={!!onTransmitterClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ReadersPanel;
