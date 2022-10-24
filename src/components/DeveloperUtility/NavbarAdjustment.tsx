/* eslint-disable i18next/no-literal-string */
import React from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { selectNavbar, setIsVisible } from '@/redux/slices/navbar';

const NavbarAdjustment = () => {
  const dispatch = useDispatch();
  const { isVisible } = useSelector(selectNavbar, shallowEqual);
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
