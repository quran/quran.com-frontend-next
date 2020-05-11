import React, { useState, ReactElement, ReactNode } from 'react';
import styled, { css } from 'styled-components';

const TabNavList = styled.ul`
  padding: 0;
`;

const selectedCss = css<{ selected: boolean }>`
  color: ${({ theme }) => theme.colors.primary};
  border-bottom: 3px solid ${({ theme }) => theme.colors.primary};
`;

const TabNavItem = styled.li<{ selected: boolean }>`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.base.unit * 1.5}rem;
  display: inline-block;
  margin-right: ${({ theme }) => theme.base.unit * 2.5}rem;
  cursor: pointer;
  ${(props) => props.selected && selectedCss}
`;

type TabsProps = {
  initial?: number;
  children: ReactElement[];
};

const Tabs = ({ initial, children }: TabsProps) => {
  const [currentTab, setCurrentTab] = useState(initial || 0);

  return (
    <div>
      <section role="tabpanel">
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role */}
        <nav role="tablist">
          <TabNavList>
            {React.Children.map(children, (child, i) => {
              const selected = currentTab === i;

              return (
                <TabNavItem selected={selected} onClick={() => setCurrentTab(i)}>
                  {child.props.title}
                </TabNavItem>
              );
            })}
          </TabNavList>
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
