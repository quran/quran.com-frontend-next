/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import classNames from 'classnames';

import styles from './Collapsible.module.scss';

type ChildrenRenderProps = {
  isOpen: boolean;
};

type Props = {
  id?: string;
  title?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  children: ({ isOpen }: ChildrenRenderProps) => React.ReactNode;
  isDefaultOpen?: boolean;
  shouldOpen?: boolean;
  shouldRotatePrefixOnToggle?: boolean;
  shouldRotateSuffixOnToggle?: boolean;
  shouldSuffixTrigger?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  direction?: CollapsibleDirection;
  headerClassName?: string;
  headerLeftClassName?: string;
};

export enum CollapsibleDirection {
  Left = 'left',
  Right = 'right',
}

const Collapsible = ({
  id,
  isDefaultOpen = false,
  prefix,
  title,
  suffix,
  children,
  shouldRotatePrefixOnToggle,
  shouldRotateSuffixOnToggle,
  shouldSuffixTrigger = false,
  shouldOpen,
  onOpenChange,
  direction = CollapsibleDirection.Left,
  headerClassName,
  headerLeftClassName,
}: Props) => {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  useEffect(() => {
    if (typeof shouldOpen !== 'boolean') return;
    setIsOpen(shouldOpen);
  }, [shouldOpen]);

  const onSuffixClicked = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!shouldSuffixTrigger) {
      e.stopPropagation();
    }
  };

  const onSuffixKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (shouldSuffixTrigger && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      // Simulate a click that will bubble to the Trigger
      e.currentTarget.click();
    } else if (!shouldSuffixTrigger) {
      e.stopPropagation();
    }
  };

  return (
    <CollapsiblePrimitive.Root onOpenChange={handleOpenChange} open={isOpen}>
      <CollapsiblePrimitive.Trigger asChild data-testid={id} id={id}>
        <div className={classNames(styles.header, headerClassName)}>
          {direction === CollapsibleDirection.Left ? (
            <>
              <div className={classNames(styles.headerLeft, headerLeftClassName)}>
                {prefix && (
                  <div
                    className={classNames(styles.prefixContainer, {
                      [styles.prefixRotated]: shouldRotatePrefixOnToggle && isOpen,
                    })}
                  >
                    {prefix}
                  </div>
                )}
                {title}
                {suffix && (
                  <div
                    className={classNames(styles.suffixContainer, {
                      [styles.suffixRotated]: shouldRotateSuffixOnToggle && isOpen,
                    })}
                    onClick={onSuffixClicked}
                    {...(shouldSuffixTrigger && {
                      onKeyDown: onSuffixKeyDown,
                      role: 'button',
                      tabIndex: 0,
                    })}
                  >
                    {suffix}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className={styles.headerLeft}>{title}</div>
              <div
                className={classNames(styles.prefixContainer, {
                  [styles.prefixRotated]: shouldRotatePrefixOnToggle && isOpen,
                })}
              >
                {prefix}
              </div>
            </>
          )}
        </div>
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.CollapsibleContent>
        {isOpen && children({ isOpen })}
      </CollapsiblePrimitive.CollapsibleContent>
    </CollapsiblePrimitive.Root>
  );
};

export default Collapsible;
