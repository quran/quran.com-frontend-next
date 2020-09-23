/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Chapters
// ====================================================

export interface Chapters_chapters_translatedName {
  __typename: "TranslatedName";
  name: string | null;
}

export interface Chapters_chapters {
  __typename: "Chapter";
  id: string;
  chapterNumber: number | null;
  nameSimple: string | null;
  translatedName: Chapters_chapters_translatedName | null;
}

export interface Chapters {
  chapters: Chapters_chapters[];
}
