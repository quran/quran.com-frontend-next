import Bismillah, { BismillahSize } from './Bismillah';

export default {
  title: 'dls/Bismillah',
  argTypes: {
    size: {
      description: `[OPTIONAL] The size of bismillah`,
      options: Object.values(BismillahSize),
      control: { type: 'radio' },
    },
  },
};

const Template = (args) => (
  <span className="previewWrapper">
    <Bismillah {...args} />
  </span>
);
export const Normal = Template.bind({});
