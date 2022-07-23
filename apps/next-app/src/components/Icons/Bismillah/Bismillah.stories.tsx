import Bismillah from './Bismillah';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'dls/Bismillah',
  argTypes: {},
};

const Template = (args) => (
  <span className="previewWrapper">
    <Bismillah {...args} />
  </span>
);
export const Normal = Template.bind({});
