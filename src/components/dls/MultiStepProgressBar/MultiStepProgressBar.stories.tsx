import React from 'react';

import MultiStepProgressBar from './index';

export default {
  title: 'dls/MultiStepProgressBar',
  component: MultiStepProgressBar,
  args: {
    steps: [],
  },
  argTypes: {},
};

const Template = (args) => {
  return <MultiStepProgressBar {...args} />;
};

export const DefaultMultiStepProgressBar = Template.bind({});

const onClick = () => {};

const generateSteps = (numberOfSteps) => {
  const steps = [];
  // eslint-disable-next-line no-plusplus
  for (let index = 0; index < numberOfSteps; index++) {
    steps.push({
      id: `${index + 1}`,
      isCompleted: index % 2 === 0,
      onClick,
    });
  }
  return steps;
};

DefaultMultiStepProgressBar.args = {
  steps: generateSteps(5),
};

export const WithALotOfSteps = Template.bind({});
WithALotOfSteps.args = {
  steps: generateSteps(12),
};
