import React, { useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './JunctureTabs.module.scss';

import { QiraatJuncture } from '@/types/Qiraat';
import { toLocalizedNumber } from '@/utils/locale';

interface JunctureTabsProps {
  junctures: QiraatJuncture[];
  selectedJunctureId: number | null;
  onJunctureSelect: (junctureId: number) => void;
}

/**
 * Tab-style selector for junctures when multiple exist for an ayah.
 * Uses textSimple (undiacritized) for better readability if available.
 * @returns {JSX.Element} The JunctureTabs component
 */
const JunctureTabs: React.FC<JunctureTabsProps> = ({
  junctures,
  selectedJunctureId,
  onJunctureSelect,
}) => {
  const { t, lang } = useTranslation('common');

  const selectedJuncture = useMemo(() => {
    return junctures.find((juncture) => juncture.id === selectedJunctureId);
  }, [junctures, selectedJunctureId]);

  const hasMultipleJunctures = junctures.length > 1;

  return (
    <div className={styles.container}>
      {hasMultipleJunctures && (
        <div className={styles.tabs} role="tablist" aria-label="Juncture selection">
          {junctures.map((juncture, index) => {
            const isSelected = selectedJunctureId === juncture.id;

            return (
              <button
                key={juncture.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={`juncture-panel-${juncture.id}`}
                tabIndex={isSelected ? 0 : -1}
                className={classNames(styles.tab)}
                onClick={() => onJunctureSelect(juncture.id)}
              >
                <span className={styles.tabText}>
                  {t(`quran-reader:qiraat.juncture`)} {toLocalizedNumber(index + 1, lang)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div
        className={styles.content}
        id={`juncture-panel-${selectedJunctureId}`}
        role={hasMultipleJunctures ? 'tabpanel' : undefined}
        aria-labelledby={hasMultipleJunctures ? `juncture-tab-${selectedJunctureId}` : undefined}
      >
        <div className={styles.label}>{t(`quran-reader:qiraat.juncture`)}:</div>
        <div className={styles.value} dir="auto">
          {selectedJuncture?.textSimple || selectedJuncture?.text}
        </div>
      </div>
    </div>
  );
};

export default JunctureTabs;
