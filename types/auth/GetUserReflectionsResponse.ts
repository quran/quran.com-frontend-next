import AyahReflection from '../QuranReflect/AyahReflection';

import Pagination from './Pagination';

type GetUserReflectionsResponse = {
  data: AyahReflection[];
  pagination: Pagination;
};

export default GetUserReflectionsResponse;
