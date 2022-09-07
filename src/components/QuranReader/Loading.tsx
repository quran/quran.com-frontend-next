import React from 'react';

import classNames from 'classnames';

import Notes from './Notes/Notes';

import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';

interface Props {
  isSideBarVisible: boolean;
  containerClassName: string;
  visibleSideBarClassName: string;
}

const Loading: React.FC<Props> = ({
  isSideBarVisible,
  containerClassName,
  visibleSideBarClassName,
}) => {
  return (
    <>
      <div
        className={classNames(containerClassName, {
          [visibleSideBarClassName]: isSideBarVisible,
        })}
      >
        <Spinner size={SpinnerSize.Large} isCentered />
      </div>
      <Notes />
    </>
  );
};

export default Loading;
