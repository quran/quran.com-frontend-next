/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

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
};

const Collapsible = ({ isDefaultOpen = false, prefix, title, suffix, children }: Props) => {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);

  return (
    <CollapsiblePrimitive.Root open={isOpen}>
      <CollapsiblePrimitive.Trigger asChild>
        <div className={styles.header} onClick={() => setIsOpen((preValue) => !preValue)}>
          <div className={styles.headerLeft}>
            <div className={styles.prefixContainer}>{prefix}</div>
            {title}
          </div>
          <div
            className={styles.suffixContainer}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
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
