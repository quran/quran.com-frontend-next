import { NextPage, GetServerSideProps } from 'next';

import withAuth from '@/components/Auth/withAuth';
import ReadingGoalPageSkeleton from '@/components/ReadingGoal/ReadingGoalPageSkeleton';
import ReadingProgressPage from '@/components/ReadingProgressPage';
import { getAllChaptersData } from '@/utils/chapter';
import withSsrRedux from '@/utils/withSsrRedux';

const ReadingGoalProgressPage: NextPage = () => {
  // we don't want to show the reading goal page if the user is not logged in
  return <ReadingProgressPage />;
};

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/reading-goal/progress',
  async ({ locale }) => {
    const allChaptersData = await getAllChaptersData(locale);
    return {
      props: {
        chaptersData: allChaptersData,
      },
    };
  },
);

export default withAuth(ReadingGoalProgressPage, <ReadingGoalPageSkeleton />);
