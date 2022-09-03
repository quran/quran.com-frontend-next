import { useEffect, memo } from 'react';

import { useDispatch } from 'react-redux';

import { incrementSessionCount } from '@/redux/slices/session';

const SessionIncrementor = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(incrementSessionCount());
  }, [dispatch]);
  return <></>;
};

export default memo(SessionIncrementor);
