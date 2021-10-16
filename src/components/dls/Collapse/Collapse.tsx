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
  children: React.ReactNode;
};
const Item = ({ title, children }: ItemProps) => (
  <Accordion.Item value={title} className={styles.item}>
    <Accordion.Header className={styles.header}>
      <Accordion.Trigger className={styles.trigger}>
        {title}
        <span className={styles.chevronIconWrapper}>
          <ChevronDownIcon />
        </span>
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content className={styles.content}>{children}</Accordion.Content>
  </Accordion.Item>
);

Collapse.Item = Item;

export default Collapse;
