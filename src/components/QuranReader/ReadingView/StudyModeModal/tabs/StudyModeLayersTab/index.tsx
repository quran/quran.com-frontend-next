/* eslint-disable react/no-danger */
/* eslint-disable max-lines */
import React, { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import GroupPanel from './GroupPanel';
import GroupToken from './GroupToken';
import useLayeredTranslationData from './hooks/useLayeredTranslationData';
import LayerControls from './LayerControls';
import styles from './StudyModeLayersTab.module.scss';
import { LayerMode } from './types';

import { getFootnote } from '@/api';
import Error from '@/components/Error';
import InlineFootnote from '@/components/QuranReader/ReadingView/InlineFootnote';
import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import { logErrorToSentry } from '@/lib/sentry';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import Language from '@/types/Language';
import { LayeredTranslationGroup, LayeredTranslationToken } from '@/types/LayeredTranslation';
import { findLanguageIdByLocale, getLanguageDataById } from '@/utils/locale';
import Footnote from 'types/Footnote';

const EMPTY_TOKENS: LayeredTranslationToken[] = [];

interface StudyModeLayersTabProps {
  chapterId: string;
  verseNumber: string;
  switchTab?: (tabId: StudyModeTabId | null) => void;
}

const StudyModeLayersTab: React.FC<StudyModeLayersTabProps> = ({
  chapterId,
  verseNumber,
  switchTab,
}) => {
  const { lang } = useTranslation('quran-reader');
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const verseKey = `${chapterId}:${verseNumber}`;
  const { data, isLoading, error, hasData, refetch } = useLayeredTranslationData(verseKey);
  const scaleClass = styles[`layers-font-size-${quranReaderStyles.layersFontScale}`];

  // Determine expandability based on actual rendered content differences.
  const isExpandable = useMemo(() => {
    if (!data?.groups?.length) return false;

    // Check if any option has different collapsed vs expanded HTML
    return data.groups.some((group) =>
      group.options.some((option) => option.collapsedHtml.trim() !== option.expandedHtml.trim()),
    );
  }, [data?.groups]);

  const [layerMode, setLayerMode] = useState<LayerMode>(LayerMode.Collapsed);
  const [selectedOptionByGroup, setSelectedOptionByGroup] = useState<Record<string, string>>({});
  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [footnote, setFootnote] = useState<Footnote | null>(null);
  const [activeFootnoteName, setActiveFootnoteName] = useState<string | null>(null);
  const [isLoadingFootnote, setIsLoadingFootnote] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const langData = getLanguageDataById(findLanguageIdByLocale(lang as Language));

  const resetFootnote = useCallback(() => {
    setFootnote(null);
    setActiveFootnoteName(null);
    setIsLoadingFootnote(false);
  }, []);

  useEffect(() => {
    setLayerMode(LayerMode.Collapsed);
    setSelectedOptionByGroup({});
    setActiveGroupKey(null);
    setIsExplanationOpen(false);
    resetFootnote();
  }, [verseKey, resetFootnote]);

  useEffect(() => {
    if (!isLoading && !hasData && switchTab) switchTab(null);
  }, [isLoading, hasData, switchTab]);

  useEffect(() => {
    if (!data?.groups?.length) return;

    setSelectedOptionByGroup((prev) => {
      const next = { ...prev };
      let changed = false;

      data.groups.forEach((group) => {
        if (!next[group.groupKey]) {
          next[group.groupKey] = group.defaultOptionKey || group.options?.[0]?.optionKey;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [data?.groups]);

  const groupsByKey = useMemo(() => {
    const map: Record<string, LayeredTranslationGroup> = {};
    data?.groups?.forEach((group) => {
      map[group.groupKey] = group;
    });
    return map;
  }, [data?.groups]);

  const tokens = useMemo(
    () =>
      (layerMode === LayerMode.Collapsed ? data?.collapsedTokens : data?.expandedTokens) ||
      EMPTY_TOKENS,
    [layerMode, data?.collapsedTokens, data?.expandedTokens],
  );

  const tokenEntries = useMemo(() => {
    const counts = new Map<string, number>();

    return tokens.map((token) => {
      const baseKey =
        token.type === 'text' ? `text:${token.html || ''}` : `group:${token.groupKey}`;
      const occurrence = counts.get(baseKey) || 0;
      counts.set(baseKey, occurrence + 1);

      return { key: `${baseKey}:${occurrence}`, token };
    });
  }, [tokens]);

  const getSelectedOptionHtml = (group: LayeredTranslationGroup) => {
    const selectedOptionKey = selectedOptionByGroup[group.groupKey];
    const selectedOption =
      group.options.find((option) => option.optionKey === selectedOptionKey) || group.options[0];
    if (!selectedOption) return '';

    return layerMode === LayerMode.Collapsed
      ? selectedOption.collapsedHtml
      : selectedOption.expandedHtml;
  };

  const onTextClicked = useCallback(
    async (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const supElement = target.closest('sup');
      if (!supElement) return;

      const footNoteId = supElement.getAttribute('foot_note');
      if (!footNoteId) return;

      event.preventDefault();
      event.stopPropagation();
      setIsExplanationOpen(false);

      const footnoteText = supElement.innerText.trim();
      setActiveFootnoteName(footnoteText);

      if (footnote && footnote.id === Number(footNoteId)) {
        resetFootnote();
        return;
      }

      setIsLoadingFootnote(true);
      try {
        const response = await getFootnote(footNoteId);
        if (response?.footNote) setFootnote(response.footNote);
      } catch (err) {
        resetFootnote();
        logErrorToSentry(err as Error, {
          transactionName: 'StudyModeLayersTab.onTextClicked',
          metadata: { footNoteId, verseKey },
        });
      } finally {
        setIsLoadingFootnote(false);
      }
    },
    [footnote, resetFootnote, verseKey],
  );

  if (isLoading) {
    return (
      <div className={styles.container}>
        <TafsirSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Error error={error} onRetryClicked={refetch} />
      </div>
    );
  }

  if (!data) return null;

  const shouldShowFootnote = footnote !== null || isLoadingFootnote;

  return (
    <div className={classNames(styles.container, scaleClass)}>
      <LayerControls
        layerMode={layerMode}
        setLayerMode={setLayerMode}
        isExpandable={isExpandable}
      />

      {data.resource.description && (
        <div>
          <div className={styles.description}>{data.resource.description}</div>
        </div>
      )}

      <div className={styles.translationText} onClick={onTextClicked} role="presentation">
        {tokenEntries.map(({ token, key }) => {
          if (token.type === 'text') {
            return <span key={key} dangerouslySetInnerHTML={{ __html: token.html || '' }} />;
          }

          const group = groupsByKey[token.groupKey];
          if (!group) return null;

          const isActive = activeGroupKey === group.groupKey;

          const handleTokenClick = () => {
            if (isActive) {
              setActiveGroupKey(null);
              setIsExplanationOpen(false);
            } else {
              setActiveGroupKey(group.groupKey);
              setIsExplanationOpen(false);
            }
          };

          const handleOptionSelect = (optionKey: string) => {
            setActiveGroupKey(null);
            setIsExplanationOpen(false);
            setSelectedOptionByGroup((prev) => ({ ...prev, [group.groupKey]: optionKey }));
          };

          return (
            <React.Fragment key={key}>
              <GroupToken
                isActive={isActive}
                selectedOptionHtml={getSelectedOptionHtml(group)}
                onClick={handleTokenClick}
              />

              {isActive && (
                <GroupPanel
                  group={group}
                  layerMode={layerMode}
                  selectedOptionKey={selectedOptionByGroup[group.groupKey]}
                  isExplanationOpen={isExplanationOpen}
                  onOptionSelect={handleOptionSelect}
                  onClose={() => setActiveGroupKey(null)}
                  onExplanationToggle={() => setIsExplanationOpen((prev) => !prev)}
                  onTextClicked={onTextClicked}
                  panelRef={panelRef}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {shouldShowFootnote && (
        <div className={styles.footnoteContainer}>
          <InlineFootnote
            footnoteName={activeFootnoteName}
            footnoteText={footnote?.text}
            isLoading={isLoadingFootnote}
            direction={langData.direction}
            onClose={resetFootnote}
          />
        </div>
      )}
    </div>
  );
};

export default StudyModeLayersTab;
