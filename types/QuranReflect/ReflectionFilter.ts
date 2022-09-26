type ReflectionFilter = {
  id: number;
  surahNumber: number;
  from: number;
  to: number;
  indicatorText: string;
  chapter: {
    id: number;
    number: number;
    size: number;
    citationNames: {
      id: number;
      name: string;
      languageId: number;
      translationId: number;
      default: boolean;
      defaultForFilter: boolean;
    }[];
  };
};

export default ReflectionFilter;
