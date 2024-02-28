import React from 'react';

import Root, { Props as RootProps } from './Root';
import Star from './Star';

interface Props extends RootProps {
  disabled?: boolean;
  maximumRating?: number;
}

const StarRating: React.FC<Props> = ({
  maximumRating = 5,
  disabled = false,
  defaultValue = '1',
  value,
  ...props
}) => {
  return (
    <Root defaultValue={defaultValue} {...props}>
      {/* eslint-disable-next-line @typescript-eslint/naming-convention */}
      {Array.from({ length: maximumRating }, (_, index) => {
        const starValue = index + 1;
        const starValueString = `${starValue}`;

        return (
          <Star
            currentValue={value}
            key={starValueString}
            // @ts-ignore
            value={starValue}
            id={starValueString}
            disabled={disabled === true}
          />
        );
      })}
    </Root>
  );
};

export default StarRating;
