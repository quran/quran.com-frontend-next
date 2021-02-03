import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectContextMenu, setIsExpanded } from 'src/redux/slices/QuranReader/contextMenu';

const ContextMenuAdjustment = () => {
  const dispatch = useDispatch();
  const { isExpanded } = useSelector(selectContextMenu);
  return (
    <div>
      Context Menu{' '}
      <button
        type="button"
        onClick={() => dispatch({ type: setIsExpanded.type, payload: !isExpanded })}
      >
        Toggle Expansion
      </button>
    </div>
  );
};

export default ContextMenuAdjustment;
