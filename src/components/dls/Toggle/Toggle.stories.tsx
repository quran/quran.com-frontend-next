import { useState } from 'react';

import Toggle from './Toggle';

export default {
  title: 'dls/Toggle',
  component: Toggle,
};

const Template = () => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <Toggle
      isChecked={isChecked}
      onClick={() => {
        setIsChecked((prevIsChecked) => !prevIsChecked);
      }}
    />
  );
};

export const DefaultToggle = Template.bind({});
