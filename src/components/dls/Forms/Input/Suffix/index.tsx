import React from 'react';

import classNames from 'classnames';

import styles from './Suffix.module.scss';

type Props = {
  suffix: React.ReactNode;
  suffixContainerClassName?: string;
  shouldUseDefaultStyles?: boolean;
};

const InputSuffix: React.FC<Props> = ({
  suffix,
  suffixContainerClassName,
  shouldUseDefaultStyles = true,
}) => {
  return (
    <>
      {suffix && (
        <div
          className={classNames(
            {
              [styles.suffix]: shouldUseDefaultStyles,
            },
            suffixContainerClassName,
          )}
        >
          {suffix}
        </div>
      )}
    </>
  );
};

export default InputSuffix;
