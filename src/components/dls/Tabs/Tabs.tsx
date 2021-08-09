/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
import React, { useState, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import styles from './Tabs.module.scss';

type TabsProps = {
  initial?: number;
  children: ReactElement[];
};

const Tabs = ({ initial = 0, children }: TabsProps) => {
  const [currentTab, setCurrentTab] = useState(initial);

  return (
    <div>
      <section role="tabpanel">
        <nav role="tablist">
          <ul className={styles.navList}>
            {React.Children.map(children, (child, i) => (
              <li
                onClick={() => setCurrentTab(i)}
                className={classNames(styles.tabNavItem, {
                  [styles.activeNavItem]: currentTab === i,
                })}
              >
                {child.props.title}
              </li>
            ))}
          </ul>
        </nav>
        {children[currentTab]}
      </section>
    </div>
  );
};

type TabProps = {
  title: string;
  children: ReactNode;
};

export const Tab = ({ children }: TabProps) => <>{children}</>;

export default Tabs;
