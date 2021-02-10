import React from 'react';
import styled from 'styled-components';
import ChapterBlock from './ChapterBlock';
import ChapterType from '../../../types/ChapterType';

const List = styled.ul`
  padding-left: 0;
`;

type Props = {
  chapters: Array<ChapterType>;
};

const ChaptersList: React.SFC<Props> = ({ chapters }: Props) => (
  <List>
    {chapters.map((chapter) => (
      <ChapterBlock key={chapter.id} chapter={chapter} />
    ))}
  </List>
);

export default ChaptersList;
