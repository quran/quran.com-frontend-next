export enum PostSortBy {
  Latest = 'latest',
  Popular = 'popular',
}

type AyahReflectionsRequestParams = {
  surahId: string;
  ayahNumber: string;
  locales: string[];
  page?: number;
  limit?: number;
  postTypeIds?: string[];
  sortBy?: PostSortBy;
};

export default AyahReflectionsRequestParams;
