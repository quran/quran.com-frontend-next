import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectNavbar, setIsVisible } from 'src/redux/slices/navbar';

const NavbarAdjustment = () => {
  const dispatch = useDispatch();
  const { isVisible } = useSelector(selectNavbar);
  return (
    <div>
      Navbar{' '}
      <button
        type="button"
        onClick={() => dispatch({ type: setIsVisible.type, payload: !isVisible })}
      >
        Toggle Navbar visibility
      </button>
    </div>
  );
};

export default NavbarAdjustment;
