import { NextPage, GetServerSideProps } from 'next';

import withAuth from '@/components/Auth/withAuth';
import ReadingProgressPage from '@/components/ReadingProgressPage';
import withSsrRedux from '@/utils/withSsrRedux';

const ReadingGoalProgressPage: NextPage = () => {
  // we don't want to show the reading goal page if the user is not logged in
  return <ReadingProgressPage />;
};

export const getServerSideProps: GetServerSideProps = withSsrRedux('/reading-goal/progress');

export default withAuth(ReadingGoalProgressPage);
