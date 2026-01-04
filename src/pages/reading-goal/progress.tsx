import { NextPage } from 'next';

import withAuth from '@/components/Auth/withAuth';
import ReadingProgressPage from '@/components/ReadingProgressPage';
import { chaptersDataGetStaticProps } from '@/utils/ssg';

const ReadingGoalProgressPage: NextPage = () => {
  // we don't want to show the reading goal page if the user is not logged in
  return <ReadingProgressPage />;
};

export const getStaticProps = chaptersDataGetStaticProps;

export default withAuth(ReadingGoalProgressPage);
