/* eslint-disable react/no-danger */
import React from 'react';
import styled from 'styled-components';
import SearchResult from 'types/SearchResult';
import styles from './SearchResultItem.module.scss';

interface Props {
  result: SearchResult;
}

const SearchResultItem: React.FC<Props> = ({ result }) => {
  return (
    <div className={styles.itemContainer}>
      <QuranTextContainer>
        <div>VerseKey</div>
        <QuranTextResult dangerouslySetInnerHTML={{ __html: result.text }} />
      </QuranTextContainer>
      {result.translations.map((translation) => (
        <div key={translation.id} className={styles.translationContainer}>
          <div dangerouslySetInnerHTML={{ __html: translation.text }} />
          <p className={styles.translationName}>{translation.name}</p>
        </div>
      ))}
    </div>
  );
};

const QuranTextContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const QuranTextResult = styled.div`
  line-height: ${(props) => props.theme.lineHeights.large};
  direction: rtl;
`;

export default SearchResultItem;
