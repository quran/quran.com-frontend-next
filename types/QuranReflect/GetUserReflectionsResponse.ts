import AyahReflection from './AyahReflection';
import QuranReflectPagination from './QuranReflectPagination';

interface GetUserReflectionsResponse extends QuranReflectPagination {
  data: AyahReflection[];
}

export default GetUserReflectionsResponse;
