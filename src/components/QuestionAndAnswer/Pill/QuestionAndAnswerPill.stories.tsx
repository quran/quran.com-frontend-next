import QuestionAndAnswerPill from '.';

import QuestionType from '@/types/QuestionsAndAnswers/QuestionType';

export default {
  title: 'QuestionsAndAnswers/Pill',
  component: QuestionAndAnswerPill,
  argTypes: {
    type: {
      control: {
        type: 'select',
      },
      options: Object.values(QuestionType),
      table: {
        category: 'Required',
      },
    },
  },
};

export const Default = (args) => (
  <span className="previewWrapper">
    <QuestionAndAnswerPill {...args} />
  </span>
);
Default.args = {
  type: QuestionType.CLARIFICATION,
};
