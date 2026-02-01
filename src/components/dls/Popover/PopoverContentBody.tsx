import React, { ReactNode } from 'react';

import styles from './Popover.module.scss';

interface PopoverContentBodyProps {
  children: ReactNode | ReactNode[];
  icon?: ReactNode;
  onIconClick?: () => void;
  iconAriaLabel?: string;
  shouldContentBeClickable?: boolean;
}

const PopoverContentBody: React.FC<PopoverContentBodyProps> = ({
  children,
  icon,
  onIconClick,
  iconAriaLabel,
  shouldContentBeClickable = false,
}) => {
  if (shouldContentBeClickable) {
    return (
      <div
        role="button"
        tabIndex={0}
        className={styles.clickableContent}
        onClick={(e) => {
          e.stopPropagation();
          onIconClick?.();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            onIconClick?.();
          }
        }}
        aria-label={iconAriaLabel}
      >
        {children}
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
    );
  }

  return (
    <>
      {children}
      {icon && (
        <span
          className={styles.icon}
          onClick={(e) => {
            e.stopPropagation();
            onIconClick?.();
          }}
          role="button"
          tabIndex={0}
          aria-label={iconAriaLabel}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onIconClick?.();
            }
          }}
        >
          {icon}
        </span>
      )}
    </>
  );
};

export default PopoverContentBody;
