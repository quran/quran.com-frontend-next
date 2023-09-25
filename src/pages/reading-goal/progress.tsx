import { NextPage } from 'next';

import ReadingProgressPage from '@/components/ReadingProgressPage';
import useRequireAuth from '@/hooks/auth/useRequireAuth';
import { chaptersDataGetStaticProps } from '@/utils/ssg';

const ReadingGoalProgressPage: NextPage = () => {
  // we don't want to show the reading goal page if the user is not logged in
  useRequireAuth();

  return <ReadingProgressPage />;
};

export const getStaticProps = chaptersDataGetStaticProps;

export default ReadingGoalProgressPage;
