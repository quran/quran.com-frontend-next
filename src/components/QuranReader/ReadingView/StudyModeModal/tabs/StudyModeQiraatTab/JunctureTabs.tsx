import React from 'react';

import classNames from 'classnames';

import styles from './JunctureTabs.module.scss';

import { QiraatJuncture } from '@/types/Qiraat';

interface JunctureTabsProps {
  junctures: QiraatJuncture[];
  selectedJunctureId: number | null;
  onJunctureSelect: (junctureId: number) => void;
}

/**
 * Tab-style selector for junctures when multiple exist for an ayah.
 * Uses textSimple (undiacritized) for better readability if available.
 */
const JunctureTabs: React.FC<JunctureTabsProps> = ({
  junctures,
  selectedJunctureId,
  onJunctureSelect,
}) => {
  if (junctures.length <= 1) {
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent, junctureId: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onJunctureSelect(junctureId);
    }
  };

  return (
    <div className={styles.container} role="tablist" aria-label="Juncture selection">
      <div className={styles.tabsWrapper}>
        {junctures.map((juncture) => {
          const isSelected = selectedJunctureId === juncture.id;
          // Use textSimple (undiacritized) if available, fallback to text
          const displayText = juncture.textSimple || juncture.text;

          return (
            <button
              key={juncture.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={`juncture-panel-${juncture.id}`}
              tabIndex={isSelected ? 0 : -1}
              className={classNames(styles.tab, {
                [styles.tabSelected]: isSelected,
              })}
              onClick={() => onJunctureSelect(juncture.id)}
              onKeyDown={(e) => handleKeyDown(e, juncture.id)}
            >
              <span className={styles.tabText}>{displayText}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default JunctureTabs;
