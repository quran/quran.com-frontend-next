import Tab from './Tab';

type AyahReflectionsRequestParams = {
  surahId: string;
  ayahNumber: string;
  locale: string;
  page?: number;

  tab?: Tab;
  reviewed?: boolean;

  postTypeIds?: string[];
};

export default AyahReflectionsRequestParams;
