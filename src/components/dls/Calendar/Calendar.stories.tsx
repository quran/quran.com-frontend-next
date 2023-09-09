import Calendar from './index';

export default {
  title: 'dls/Calendar',
  component: Calendar,
  args: {
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    isLoading: false,
  },
  argTypes: {
    month: {
      description: 'The month of the calendar',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      options: new Array(12).fill(0).map((_, i) => i + 1),
      control: 'select',
    },
    year: {
      description: 'The year of the calendar',
      control: 'number',
    },
    isLoading: {
      description: '[OPTIONAL] indicate whether the calendar is in loading state or not',
      control: 'boolean',
    },
  },
};

const Template = (args) => <Calendar {...args} />;

export const DefaultCalendar = Template.bind({});
DefaultCalendar.args = {};

export const LoadingCalendar = Template.bind({});
LoadingCalendar.args = {
  isLoading: true,
};
