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
  title?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  children: ({ isOpen }: ChildrenRenderProps) => React.ReactNode;
  isDefaultOpen?: boolean;
  shouldOpen?: boolean;
  shouldRotatePrefixOnToggle?: boolean;
  shouldRotateSuffixOnToggle?: boolean;
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
  isDefaultOpen = false,
  prefix,
  title,
  suffix,
  children,
  shouldRotatePrefixOnToggle,
  shouldRotateSuffixOnToggle,
  shouldOpen,
  onOpenChange,
  direction = CollapsibleDirection.Left,
  headerClassName,
  headerLeftClassName,
}: Props) => {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);

  useEffect(() => {
    setIsOpen(shouldOpen);
  }, [shouldOpen]);

  const onHeaderClicked = () => setIsOpen((preValue) => !preValue);

  const onSuffixClicked = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <CollapsiblePrimitive.Root onOpenChange={onOpenChange} open={isOpen}>
      <CollapsiblePrimitive.Trigger asChild>
        <div className={classNames(styles.header, headerClassName)} onClick={onHeaderClicked}>
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
