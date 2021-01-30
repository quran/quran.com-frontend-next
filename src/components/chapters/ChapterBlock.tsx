import React from 'react';
import styled from 'styled-components';
import Link from 'next-translate/Link';
import ChapterType from 'types/ChapterType';
import ChapterIcon from './ChapterIcon';

const Item = styled.li`
  list-style: none;
  margin-bottom: ${({ theme }) => theme.spacing.large};

  &:hover {
    background: #f1f1f1;
  }
`;

const NameArabic = styled.div`
  font-size: 1.25rem;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  color: ${({ theme }) => theme.colors.text.default};
`;

const Number = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.primary.medium};
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-left: 0.75rem;
`;

const NameEnglish = styled.div`
  font-size: 0.8rem;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.primary.medium};
`;

const StyledLink = styled.a`
  display: block;
  padding: 10px 10px;
  text-decoration: none;
`;

const Container = styled.div`
  display: flex;
  width: 100%;
`;

type Props = {
  chapter: ChapterType;
};

const ChapterBlock: React.SFC<Props> = ({ chapter }: Props) => (
  <Item key={chapter.id}>
    <Link as={`/${chapter.id}`} href="/[chapterId]" passHref>
      <StyledLink>
        <Container>
          <Number>{chapter.chapterNumber}</Number>
          <NameContainer>
            <NameArabic>{chapter.nameSimple}</NameArabic>
            <NameEnglish>{chapter.translatedName.name}</NameEnglish>
          </NameContainer>
          <ChapterIcon id={String(chapter.id)} />
        </Container>
      </StyledLink>
    </Link>
  </Item>
);

export default ChapterBlock;
