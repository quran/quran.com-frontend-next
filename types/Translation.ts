interface Translation {
  id?: number;
  languageName: string;
  languageId?: number;
  text: string;
  resourceName?: string | null;
  resourceId?: number;
  authorName?: string;
}

export default Translation;
