import React, { useState } from 'react';
import { IS_DEVELOPMENT } from 'src/utils/environment';
import styled from 'styled-components';
import { BsWrench } from 'react-icons/bs';
import Draggable from 'react-draggable';
import FontAdjustment from './FontAdjustment';
import ReadingViewAdjustment from './ReadingViewAdjustment';
import NotesAdjustment from './NotesAdjustment';
import AudioPlayerAdjustment from './AudioPlayerAdjustment';
import NavbarAdjustment from './NavbarAdjustment';
import ContextMenuAdjustment from './ContextMenuAdjustment';
/**
 * A set of developer utilities only availble on development environments
 */
const DeveloperUtility = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!IS_DEVELOPMENT) {
    return <></>;
  }

  if (!isExpanded) {
    return (
      <Draggable bounds="parent">
        <Container expanded={false} type="button" onClick={() => setIsExpanded(true)}>
          <StyledWrench />
        </Container>
      </Draggable>
    );
  }

  return (
    <Draggable bounds="parent">
      <Container type="button" expanded>
        Developer Utility
        <hr />
        <FontAdjustment />
        <ReadingViewAdjustment />
        <NotesAdjustment />
        <NavbarAdjustment />
        <AudioPlayerAdjustment />
        <ContextMenuAdjustment />
        <div>
          <button type="button" onClick={() => setIsExpanded(false)}>
            close
          </button>
        </div>
      </Container>
    </Draggable>
  );
};

const Container = styled.button.attrs({
  'aria-label': 'developer-utility',
})<{ expanded: boolean }>`
  background: black;
  color: white;
  position: fixed;
  top: calc(${(props) => props.theme.spacing.mega} + ${(props) => props.theme.spacing.medium});
  right: calc(${(props) => props.theme.spacing.mega} + ${(props) => props.theme.spacing.medium});
  height: ${(props) => (props.expanded ? 'auto' : `calc(2 *${props.theme.spacing.mega})`)};
  width: ${(props) => (props.expanded ? 'auto' : `calc(2 *${props.theme.spacing.mega})`)};
  z-index: 100;
  border-radius: ${(props) => (props.expanded ? '10%' : ' 100%')};
  box-shadow: ${(props) => props.theme.shadows.regular};
  text-align: center;
`;

const StyledWrench = styled(BsWrench)`
  height: calc(2 * ${(props) => props.theme.spacing.mega});
  width: calc(${(props) => props.theme.spacing.large} + ${(props) => props.theme.spacing.xxsmall});
`;
export default DeveloperUtility;
