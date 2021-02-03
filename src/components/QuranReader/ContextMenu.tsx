import React from 'react';
import { selectContextMenu } from 'src/redux/slices/QuranReader/contextMenu';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

const ContextMenu = () => {
  const { isExpanded } = useSelector(selectContextMenu);
  return <Container isExpanded={isExpanded}>[Placeholder Context Menu]</Container>;
};

const Container = styled.div<{ isExpanded: boolean }>`
  background: #ffb800;
  text-align: center;
  transition: ${(props) => props.theme.transitions.regular};
  height: ${(props) => (props.isExpanded ? props.theme.spacing.mega : props.theme.spacing.medium)};
`;

export default ContextMenu;
