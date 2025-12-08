import { fetcher } from '@/api';
import { executeGroqQuery } from '@/lib/sanity';
import { Course } from '@/types/auth/Course';
import { makeGetCourseUrl } from '@/utils/auth/apiPaths';

export const PRODUCT_UPDATES_QUERY =
  '*[_type == "productUpdate"]| order(date desc){ title, slug, mainPhoto, date, summary }';

export const SINGLE_PRODUCT_UPDATE_QUERY =
  '*[_type == "productUpdate" && slug.current == $slug][0]';

export const getCourseBySlug = async (slug: string): Promise<Course> => {
  return fetcher<Course>(makeGetCourseUrl(slug));
};

export const getProductUpdatesPage = async () => {
  return executeGroqQuery(PRODUCT_UPDATES_QUERY);
};

export const getSingleProductUpdatePage = async (slug: string) => {
  return executeGroqQuery(
    SINGLE_PRODUCT_UPDATE_QUERY,
    {
      slug,
    },
    true,
  );
};
