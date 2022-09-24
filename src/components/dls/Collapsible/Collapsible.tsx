/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import classNames from 'classnames';

import styles from './Collapsible.module.scss';

type ChildrenRenderProps = {
  isOpen: boolean;
};

type Props = {
  title: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  children: ({ isOpen }: ChildrenRenderProps) => React.ReactNode;
  isDefaultOpen?: boolean;
  shouldRotatePrefixOnToggle?: boolean;
};

const Collapsible = ({
  isDefaultOpen = false,
  prefix,
  title,
  suffix,
  children,
  shouldRotatePrefixOnToggle,
}: Props) => {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);

  const onSuffixClicked = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onHeaderClicked = () => setIsOpen((preValue) => !preValue);

  return (
    <CollapsiblePrimitive.Root open={isOpen}>
      <CollapsiblePrimitive.Trigger asChild>
        <div className={styles.header} onClick={onHeaderClicked}>
          <div className={styles.headerLeft}>
            <div
              className={classNames(styles.prefixContainer, {
                [styles.prefixRotated]: shouldRotatePrefixOnToggle && isOpen,
              })}
            >
              {prefix}
            </div>
            {title}
          </div>
          <div className={styles.suffixContainer} onClick={onSuffixClicked}>
            {suffix}
          </div>
        </div>
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.CollapsibleContent>
        {isOpen && children({ isOpen })}
      </CollapsiblePrimitive.CollapsibleContent>
    </CollapsiblePrimitive.Root>
  );
};

export default Collapsible;
