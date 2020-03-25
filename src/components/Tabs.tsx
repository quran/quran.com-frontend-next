import React, { useState } from 'react';
import styled from 'styled-components';
import { Row, Col } from 'styled-bootstrap-grid';

const NavTab = styled.button<{ selected: boolean }>`
  font-family: Maison Neue;
  font-style: normal;
  font-weight: ${(props) => (props.selected ? 'bold' : 500)};
  font-size: 14px;
  line-height: 32px;
  letter-spacing: -0.02em;
  color: #222222;
  border: none;
  width: 100%;
  background: none;
  text-align: left;
  padding-left: 0px;
  opacity: ${(props) => (props.selected ? 1 : 0.6)};
`;

const BorderBottom = styled.hr<{ selected: boolean }>`
  position: absolute;
  width: 100%;
  opacity: ${(props) => (props.selected ? 1 : 0.6)};
  border-bottom: 2px solid #000;
`;

interface TabsProps {
  defaultKey: string;
  children: NonNullable<React.ReactNode>;
}

export const Tab = ({
  label,
  key,
  children,
  onClick,
  selected,
}: {
  label: string;
  key: string;
  children?: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <NavTab onClick={handleClick} selected={selected}>
      {label}
      <BorderBottom selected={selected} />
    </NavTab>
  );
};

const Tabs = ({ children, defaultKey }: TabsProps) => {
  const [selectedKey, setSelectedKey] = useState(defaultKey);

  let content = null;

  const nav = (
    <nav role="tablist">
      <Row>
        {React.Children.map(children, (child, i) => {
          if (!child) {
            return null;
          }

          const { key, props } = child as React.ReactElement;
          const selected = key === selectedKey || (!selectedKey && i === 0);

          if (selected && props && props.children) {
            content = props.children;
          }

          return (
            <Col xl="4">
              {React.cloneElement(child as React.ReactElement, {
                keyName: String(key),
                selected,
                onClick: () => setSelectedKey(String(key)),
              })}
            </Col>
          );
        })}
      </Row>
    </nav>
  );

  return (
    <>
      {nav}
      {content && <section role="tabpanel">{content}</section>}
    </>
  );
};

export default Tabs;
