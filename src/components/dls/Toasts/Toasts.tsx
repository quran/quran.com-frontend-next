import React from 'react';
import styled from 'styled-components';
import Toast from './Toast';
import useToasts from '../../../hooks/useToasts';

const ToastsContainer = styled.div`
  position: fixed;
  bottom: ${(props) => props.theme.base.px * 1.5}px;
  left: 50%;
  transform: translate(-50%, 0);
  width: 500px;
  z-index: 9999;
`;

const Toasts = () => {
  const { toasts } = useToasts();

  return (
    <ToastsContainer>
      {toasts.map((toast) => (
        <Toast {...toast.props} key={toast.id} id={toast.id} message={toast.message} />
      ))}
    </ToastsContainer>
  );
};

export default Toasts;
