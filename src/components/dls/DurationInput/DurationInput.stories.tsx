import { useState } from 'react';

import DurationInput from '.';

export default {
  title: 'dls/DurationInput',
  component: DurationInput,
  argTypes: {},
};

export const Default = (args) => {
  const [totalSeconds, setTotalSeconds] = useState(0);

  return (
    <DurationInput
      {...args}
      totalSeconds={totalSeconds}
      onTotalSecondsChange={(s) => setTotalSeconds(s)}
    />
  );
};
