import React from 'react';

import classNames from 'classnames';

import styles from './RwayahTag.module.scss';

import { QiraatTransmitter } from '@/types/Qiraat';

interface RwayahTagProps {
  transmitter: QiraatTransmitter;
  color: string;
  onClick?: () => void;
  isClickable?: boolean;
}

/**
 * Color-coded pill tag for a transmitter (Rwayah) name.
 * Background color matches the parent reading's card color.
 */
const RwayahTag: React.FC<RwayahTagProps> = ({
  transmitter,
  color,
  onClick,
  isClickable = false,
}) => {
  const handleClick = () => {
    if (isClickable && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <span
      className={classNames(styles.tag, {
        [styles.clickable]: isClickable,
      })}
      style={{ '--tag-color': color } as React.CSSProperties}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {transmitter.name}
    </span>
  );
};

export default RwayahTag;
