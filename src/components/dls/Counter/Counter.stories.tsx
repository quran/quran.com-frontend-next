/* eslint-disable react/no-multi-comp */
import { useState } from 'react';

import Counter from './Counter';

export default {
  title: 'dls/Title',
  component: Counter,
};

export const Default = () => {
  const [count, setCount] = useState(0);

  return (
    <Counter
      count={count}
      onDecrement={() => setCount(count - 1)}
      onIncrement={() => setCount(count + 1)}
    />
  );
};

export const WithMinAndMax = () => {
  const [count, setCount] = useState(0);

  const max = 10;
  const min = 1;

  // set onDecrement to null to disable it
  // set onIncrement to null to disable it
  return (
    <Counter
      count={count}
      onDecrement={count === min ? null : () => setCount(count - 1)}
      onIncrement={count === max ? null : () => setCount(count + 1)}
    />
  );
};
