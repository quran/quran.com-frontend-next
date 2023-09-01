/* eslint-disable i18next/no-literal-string */
import React from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { selectContextMenu, setIsExpandedAction } from '@/redux/slices/QuranReader/contextMenu';

const ContextMenuAdjustment = () => {
  const dispatch = useDispatch();
  const { isExpanded } = useSelector(selectContextMenu, shallowEqual);
  return (
    <div>
      Context Menu{' '}
      <button type="button" onClick={() => dispatch(setIsExpandedAction(!isExpanded))}>
        Toggle Expansion
      </button>
    </div>
  );
};

export default ContextMenuAdjustment;
