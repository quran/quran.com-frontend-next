/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Chapter
// ====================================================

export interface Chapter_chapter_translatedName {
  __typename: "TranslatedName";
  name: string | null;
}

export interface Chapter_chapter {
  __typename: "Chapter";
  id: string;
  chapterNumber: number | null;
  nameSimple: string | null;
  translatedName: Chapter_chapter_translatedName | null;
}

export interface Chapter {
  chapter: Chapter_chapter;
}

export interface ChapterVariables {
  id: string;
}
