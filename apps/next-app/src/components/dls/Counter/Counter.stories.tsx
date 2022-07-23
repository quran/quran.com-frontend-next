/* eslint-disable react/no-multi-comp */
import { useState } from 'react';

import Counter from './Counter';
import styles from './Counter.stories.module.scss';

export default {
  title: 'dls/Counter',
  component: Counter,
};

const DefaultTemplate = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="previewWrapper">
      <Counter
        count={count}
        onDecrement={() => setCount(count - 1)}
        onIncrement={() => setCount(count + 1)}
      />
    </div>
  );
};

export const Default = DefaultTemplate.bind({});

const WithMinAndMaxTemplate = () => {
  const [count, setCount] = useState(0);

  const max = 4;
  const min = 1;

  // set onDecrement to null to disable it
  // set onIncrement to null to disable it
  return (
    <>
      <span className={styles.title}>
        This counter has min value of {min} and max of {max}
      </span>
      <div className="previewWrapper">
        <Counter
          count={count}
          onDecrement={count === min ? null : () => setCount(count - 1)}
          onIncrement={count === max ? null : () => setCount(count + 1)}
        />
      </div>
    </>
  );
};

export const WithMinAndMax = WithMinAndMaxTemplate.bind({});
