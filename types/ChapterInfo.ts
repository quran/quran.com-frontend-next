interface ChapterInfo {
  id: number;
  chapterId: number;
  text: string;
  shortText: string;
  source: string;
  languageName?: string;
  resourceId?: number;
}

export interface ChapterInfoResource {
  id: number;
  name: string;
  slug: string;
  authorName: string;
  languageName: string;
  translatedName?: {
    name: string;
    languageName: string;
  };
}

export default ChapterInfo;
