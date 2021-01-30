import React, { useState, ReactElement, ReactNode } from 'react';
import styled, { css } from 'styled-components';

const TabNavList = styled.ul`
  padding: 0;
`;

const selectedCss = css<{ selected: boolean }>`
  color: ${({ theme }) => theme.colors.primary.medium};
  border-bottom: 3px solid ${({ theme }) => theme.colors.primary.medium};
`;

const TabNavItem = styled.li<{ selected: boolean }>`
  color: ${({ theme }) => theme.colors.text.default};
  font-size: ${({ theme }) => theme.spacing.large};
  display: inline-block;
  margin-right: ${({ theme }) => theme.spacing.mega};
  cursor: pointer;
  ${(props) => props.selected && selectedCss}
`;

type TabsProps = {
  initial?: number;
  children: ReactElement[];
};

const Tabs = ({ initial = 0, children }: TabsProps) => {
  const [currentTab, setCurrentTab] = useState(initial);

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
