import React, { useState } from 'react';
import { IS_DEVELOPMENT } from 'src/utils/environment';
import styled from 'styled-components';
import { BsWrench } from 'react-icons/bs';
import FontAdjustment from './FontAdjustment';
import ReadingViewAdjustment from './ReadingViewAdjustment';

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
      <Container expanded={false} type="button" onClick={() => setIsExpanded(true)}>
        <StyledWrench />
      </Container>
    );
  }

  return (
    <Container expanded>
      <FontAdjustment />
      <ReadingViewAdjustment />
      <div>
        <button type="button" onClick={() => setIsExpanded(false)}>
          close
        </button>
      </div>
    </Container>
  );
};

const Container = styled.button<{ expanded: boolean }>`
  background: black;
  color: white;
  position: fixed;
  top: 50px;
  right: 50px;
  height: ${(props) => (props.expanded ? 'auto' : ' 60px')};
  width: ${(props) => (props.expanded ? 'auto' : ' 60px')};
  z-index: 100;
  border-radius: ${(props) => (props.expanded ? '10%' : ' 100%')};
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  text-align: center;
`;

const StyledWrench = styled(BsWrench)`
  height: 60px;
  width: 25px;
`;
export default DeveloperUtility;
