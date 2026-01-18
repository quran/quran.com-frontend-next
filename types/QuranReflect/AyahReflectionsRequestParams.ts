type AyahReflectionsRequestParams = {
  surahId: string;
  ayahNumber: string;
  locales: string[];
  page?: number;
  postTypeIds?: string[];
};

export default AyahReflectionsRequestParams;
