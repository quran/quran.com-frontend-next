/* eslint-disable react/no-multi-comp */
import * as Accordion from '@radix-ui/react-accordion';

import ChevronDownIcon from '../../../../public/icons/chevron_down.svg';

import styles from './Collapse.module.scss';

const Collapse = ({ children }) => (
  <Accordion.Root type="single" className={styles.group}>
    {children}
  </Accordion.Root>
);

type ItemProps = {
  title?: string;
  id: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
};
const Item = ({ title, children, id, headerAction }: ItemProps) => (
  <Accordion.Item value={id} className={styles.item}>
    <Accordion.Header>
      <Accordion.Trigger asChild>
        <div className={styles.header}>
          {headerAction && <div className={styles.headerActionContainer}>{headerAction}</div>}
          <div className={styles.trigger}>
            <span className={styles.chevronIconWrapper}>
              <ChevronDownIcon />
            </span>
            {title}
          </div>
        </div>
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content className={styles.content}>{children}</Accordion.Content>
  </Accordion.Item>
);

Collapse.Item = Item;

export default Collapse;
