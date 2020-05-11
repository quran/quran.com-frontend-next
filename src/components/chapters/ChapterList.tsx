import React from 'react';
import styled from 'styled-components';
import { Col } from 'styled-bootstrap-grid';
import ChapterBlock from './ChapterBlock';
import ChapterType from '../../../types/ChapterType';

const List = styled.ul`
  padding-left: 0px;
`;

type Props = {
  chapters: Array<ChapterType>;
};

const ChaptersList: React.SFC<Props> = ({ chapters }: Props) => (
  <Col md={4}>
    <List>
      {chapters.map((chapter) => (
        <ChapterBlock key={chapter.id} chapter={chapter} />
      ))}
    </List>
  </Col>
);

export default ChaptersList;
