type AyahReflectionsRequestParams = {
  surahId: string;
  ayahNumber: string;
  locale: string;
  page?: number;
  tab?: string;
  reviewed?: boolean;
  postTypeIds?: string[];
};

export default AyahReflectionsRequestParams;
