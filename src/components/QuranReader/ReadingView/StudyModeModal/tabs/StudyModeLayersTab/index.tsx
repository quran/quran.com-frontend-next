/* eslint-disable react/no-danger */
/* eslint-disable max-lines */
import React, { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import useLayeredTranslationData from './hooks/useLayeredTranslationData';
import styles from './StudyModeLayersTab.module.scss';

import { getFootnote } from '@/api';
import Error from '@/components/Error';
import InlineFootnote from '@/components/QuranReader/ReadingView/InlineFootnote';
import FontSizeControl from '@/components/QuranReader/ReadingView/StudyModeModal/FontSizeControl';
import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import IconContainer from '@/dls/IconContainer/IconContainer';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import CloseIcon from '@/icons/close.svg';
import ExpandArrowIcon from '@/icons/expand-arrow.svg';
import { logErrorToSentry } from '@/lib/sentry';
import Language from '@/types/Language';
import { LayeredTranslationGroup, LayeredTranslationToken } from '@/types/LayeredTranslation';
import { findLanguageIdByLocale, getLanguageDataById } from '@/utils/locale';
import Footnote from 'types/Footnote';

type LayerMode = 'collapsed' | 'expanded';
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
  const { t, lang } = useTranslation('quran-reader');
  const verseKey = `${chapterId}:${verseNumber}`;
  const { data, isLoading, error, hasData, refetch } = useLayeredTranslationData(verseKey);

  const [layerMode, setLayerMode] = useState<LayerMode>('expanded');
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
    setLayerMode('expanded');
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
      (layerMode === 'collapsed' ? data?.collapsedTokens : data?.expandedTokens) || EMPTY_TOKENS,
    [layerMode, data?.collapsedTokens, data?.expandedTokens],
  );
  const tokenEntries = useMemo(() => {
    const counts = new Map<string, number>();

    return tokens.map((token) => {
      const baseKey =
        token.type === 'text' ? `text:${token.html || ''}` : `group:${token.groupKey}`;
      const occurrence = counts.get(baseKey) || 0;
      counts.set(baseKey, occurrence + 1);

      return {
        key: `${baseKey}:${occurrence}`,
        token,
      };
    });
  }, [tokens]);

  const getSelectedOptionHtml = (group: LayeredTranslationGroup) => {
    const selectedOptionKey = selectedOptionByGroup[group.groupKey];
    const selectedOption =
      group.options.find((option) => option.optionKey === selectedOptionKey) || group.options[0];
    if (!selectedOption) return '';

    return layerMode === 'collapsed' ? selectedOption.collapsedHtml : selectedOption.expandedHtml;
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
      setActiveGroupKey(null);
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
        if (response?.footNote) {
          setFootnote(response.footNote);
        }
      } catch (err) {
        logErrorToSentry(err as Error, {
          transactionName: 'StudyModeLayersTab.onTextClicked',
          metadata: { footNoteId, verseKey },
        });
        resetFootnote();
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
  const activeGroup = activeGroupKey ? groupsByKey[activeGroupKey] : null;

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <FontSizeControl fontType="tafsir" />
        <button
          type="button"
          className={styles.layerButton}
          onClick={() => setLayerMode((prev) => (prev === 'expanded' ? 'collapsed' : 'expanded'))}
        >
          <IconContainer
            icon={<ExpandArrowIcon />}
            shouldForceSetColors={false}
            className={styles.layerButtonIcon}
          />
          {layerMode === 'expanded' ? t('layers.contract') : t('layers.expand')}
        </button>
      </div>

      {data.resource.description && (
        <div className={styles.description}>{data.resource.description}</div>
      )}

      <div className={styles.translationText} onClick={onTextClicked} role="presentation">
        {tokenEntries.map(({ token, key }) => {
          if (token.type === 'text') {
            return <span key={key} dangerouslySetInnerHTML={{ __html: token.html || '' }} />;
          }

          const group = groupsByKey[token.groupKey];
          if (!group) return null;

          const isActive = activeGroupKey === group.groupKey;

          const handleClick = () => {
            if (isActive) {
              setActiveGroupKey(null);
              setIsExplanationOpen(false);
            } else {
              setActiveGroupKey(group.groupKey);
              setIsExplanationOpen(false);
            }
          };

          return (
            <span
              key={key}
              role="button"
              tabIndex={0}
              aria-label={t('layers.alternative-translations')}
              className={classNames(styles.groupToken, { [styles.groupTokenActive]: isActive })}
              onClick={handleClick}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  handleClick();
                }
              }}
            >
              <span
                className={styles.groupTokenText}
                dangerouslySetInnerHTML={{ __html: getSelectedOptionHtml(group) }}
              />

              <ChevronDownIcon className={styles.groupTokenChevron} />
            </span>
          );
        })}
      </div>

      {activeGroup && (
        <div ref={panelRef} className={styles.groupPanel}>
          <div className={styles.groupPanelHeader}>
            <span>{t('layers.alternative-translations')}</span>
            <button
              type="button"
              aria-label={t('aria.close-alternative-translations')}
              className={styles.closeGroupPanelButton}
              onClick={() => setActiveGroupKey(null)}
            >
              <IconContainer
                icon={<CloseIcon />}
                shouldForceSetColors={false}
                className={styles.closeIcon}
              />
            </button>
          </div>
          <div className={styles.optionsList}>
            {activeGroup.options.map((option) => {
              const optionHtml =
                layerMode === 'collapsed' ? option.collapsedHtml : option.expandedHtml;
              const isSelected = selectedOptionByGroup[activeGroup.groupKey] === option.optionKey;

              return (
                <button
                  key={option.optionKey}
                  type="button"
                  className={classNames(styles.optionButton, {
                    [styles.optionButtonActive]: isSelected,
                  })}
                  onClick={() => {
                    setSelectedOptionByGroup((prev) => ({
                      ...prev,
                      [activeGroup.groupKey]: option.optionKey,
                    }));
                    setActiveGroupKey(null);
                    setIsExplanationOpen(false);
                  }}
                >
                  <span className={styles.optionIndex}>{option.position}</span>
                  <span
                    className={styles.optionText}
                    dangerouslySetInnerHTML={{ __html: optionHtml }}
                  />
                </button>
              );
            })}
          </div>

          {!!activeGroup.explanationHtml && (
            <div className={styles.explanationWrapper}>
              <button
                type="button"
                className={styles.explanationToggle}
                onClick={() => setIsExplanationOpen((prev) => !prev)}
              >
                <span>
                  {isExplanationOpen ? t('layers.close-explanation') : t('layers.read-explanation')}
                </span>
                <ChevronDownIcon
                  className={classNames(styles.explanationChevron, {
                    [styles.explanationChevronOpen]: isExplanationOpen,
                  })}
                />
              </button>

              {isExplanationOpen && (
                <div
                  className={styles.explanationText}
                  onClick={onTextClicked}
                  role="presentation"
                  dangerouslySetInnerHTML={{ __html: activeGroup.explanationHtml }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {shouldShowFootnote && (
        <InlineFootnote
          footnoteName={activeFootnoteName}
          footnoteText={footnote?.text}
          isLoading={isLoadingFootnote}
          direction={langData.direction}
          onClose={resetFootnote}
        />
      )}
    </div>
  );
};

export default StudyModeLayersTab;
