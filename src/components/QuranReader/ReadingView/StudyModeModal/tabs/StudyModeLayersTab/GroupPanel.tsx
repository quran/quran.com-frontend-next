import React, { MouseEvent } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './StudyModeLayersTab.module.scss';
import { LayerMode } from './types';

import IconContainer from '@/dls/IconContainer/IconContainer';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import CloseIcon from '@/icons/close.svg';
import { LayeredTranslationGroup } from '@/types/LayeredTranslation';

interface GroupPanelProps {
  group: LayeredTranslationGroup;
  layerMode: LayerMode;
  selectedOptionKey: string;
  isExplanationOpen: boolean;
  onOptionSelect: (optionKey: string) => void;
  onClose: () => void;
  onExplanationToggle: () => void;
  onTextClicked: (event: MouseEvent) => void;
  panelRef: React.RefObject<HTMLDivElement>;
}

const GroupPanel: React.FC<GroupPanelProps> = ({
  group,
  layerMode,
  selectedOptionKey,
  isExplanationOpen,
  onOptionSelect,
  onClose,
  onExplanationToggle,
  onTextClicked,
  panelRef,
}) => {
  const { t } = useTranslation('quran-reader');

  return (
    <div ref={panelRef} className={styles.groupPanel}>
      <div className={styles.groupPanelHeader}>
        <span>{t('layers.alternative-translations')}</span>
        <button
          type="button"
          aria-label={t('aria.close-alternative-translations')}
          className={styles.closeGroupPanelButton}
          onClick={onClose}
        >
          <IconContainer
            icon={<CloseIcon />}
            shouldForceSetColors={false}
            className={styles.closeIcon}
          />
        </button>
      </div>
      <div className={styles.optionsList}>
        {group.options.map((option) => {
          const optionHtml =
            layerMode === LayerMode.Collapsed ? option.collapsedHtml : option.expandedHtml;
          const isSelected = selectedOptionKey === option.optionKey;

          return (
            <button
              key={option.optionKey}
              type="button"
              className={classNames(styles.optionButton, {
                [styles.optionButtonActive]: isSelected,
              })}
              onClick={() => onOptionSelect(option.optionKey)}
            >
              <span className={styles.optionIndex}>{option.position}</span>
              <span
                className={styles.optionText}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: optionHtml }}
              />
            </button>
          );
        })}
      </div>

      {!!group.explanationHtml && (
        <div className={styles.explanationWrapper}>
          <button
            type="button"
            className={styles.explanationToggle}
            onClick={onExplanationToggle}
            aria-expanded={isExplanationOpen}
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
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: group.explanationHtml }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default GroupPanel;
