import gql from 'graphql-tag';

export const CHAPTERS_QUERY = gql`
  query Chapters {
    chapters {
      id
      chapterNumber
      nameSimple
      translatedName {
        name
      }
    }
  }
`;

export const CHAPTER_QUERY = gql`
  query Chapter($id: ID!) {
    chapter(id: $id) {
      id
      chapterNumber
      nameSimple
      translatedName {
        name
      }
    }
  }
`;
