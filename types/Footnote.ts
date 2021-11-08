interface Footnote {
  id: number | string;
  text: string;
  languageName?: string;
  languageId?: number;
  isStaticContent?: boolean;
}

export default Footnote;
