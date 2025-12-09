/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

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

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setIsOpen(newOpen);
      if (onOpenChange) {
        onOpenChange(newOpen);
      }
    },
    [onOpenChange],
  );

  useEffect(() => {
    if (typeof shouldOpen !== 'boolean') return;
    setIsOpen(shouldOpen);
  }, [shouldOpen]);

  const onSuffixClicked = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!shouldSuffixTrigger) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [shouldSuffixTrigger],
  );

  const onSuffixKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (shouldSuffixTrigger && (e.key === 'Enter' || e.key === ' ')) {
        // Simulate a click that will bubble to the Trigger
        e.currentTarget.click();
      } else if (!shouldSuffixTrigger) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [shouldSuffixTrigger],
  );

  const suffixProps = useMemo(
    () =>
      shouldSuffixTrigger
        ? {
            onClick: onSuffixClicked,
            onKeyDown: onSuffixKeyDown,
            role: 'button' as const,
            tabIndex: 0,
          }
        : {},
    [shouldSuffixTrigger, onSuffixClicked, onSuffixKeyDown],
  );

  const renderPrefix = () => {
    if (!prefix) return null;

    return (
      <div
        className={classNames(styles.prefixContainer, {
          [styles.prefixRotated]: shouldRotatePrefixOnToggle && isOpen,
        })}
      >
        {prefix}
      </div>
    );
  };

  const renderSuffix = () => {
    if (!suffix) return null;

    return (
      <div
        className={classNames(styles.suffixContainer, {
          [styles.suffixRotated]: shouldRotateSuffixOnToggle && isOpen,
        })}
        {...suffixProps}
      >
        {suffix}
      </div>
    );
  };

  const renderHeaderContent = () => {
    if (direction === CollapsibleDirection.Left) {
      return (
        <div className={classNames(styles.headerLeft, headerLeftClassName)}>
          {renderPrefix()}
          {title}
          {renderSuffix()}
        </div>
      );
    }

    return (
      <>
        <div className={styles.headerLeft}>{title}</div>
        {renderPrefix()}
      </>
    );
  };

  return (
    <CollapsiblePrimitive.Root onOpenChange={handleOpenChange} open={isOpen}>
      <CollapsiblePrimitive.Trigger asChild data-testid={id} id={id}>
        <div className={classNames(styles.header, headerClassName)}>{renderHeaderContent()}</div>
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.CollapsibleContent>
        {children({ isOpen })}
      </CollapsiblePrimitive.CollapsibleContent>
    </CollapsiblePrimitive.Root>
  );
};

export default Collapsible;
