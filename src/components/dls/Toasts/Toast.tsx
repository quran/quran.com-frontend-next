import React, { useState } from 'react';
import styled from 'styled-components';
import { useTimeoutFn, useMountedState } from 'react-use';
import Text from '../Text/Text';
import IconButton from '../IconButton/IconButton';
import useToasts, { ToastProps } from '../../../hooks/useToasts';

const toastContainerCss = (props) => ({
  marginTop: props.theme.base.px * 1.5,
  padding: '1rem',
  backgroundColor: props.theme.colors.text,
  boxShadow: '',
  willChange: 'transform, opacity',
  transform: 'translateY(100%) scale(0.75)',
  transition: 'transform .2s, opacity .2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  opacity: 0,
  lineHeight: 1,
  borderRadius: props.theme.border.radius,
});

const toastVisible = () => ({
  transform: 'translateY(0) scale(1)',
  opacity: 1,
});

const toastSuccess = (props) => ({
  backgroundColor: props.theme.colors.green,
});

const toastDanger = (props) => ({
  backgroundColor: props.theme.colors.red,
});

const toastInfo = (props) => ({
  backgroundColor: props.theme.colors.blue,
});

const ToastContainer = styled.div<{
  visible?: boolean;
  success?: boolean;
  danger?: boolean;
  info?: boolean;
}>`
  ${toastContainerCss}
  ${(props) => props.visible && toastVisible}
  ${(props) => props.success && toastSuccess}
  ${(props) => props.danger && toastDanger}
  ${(props) => props.info && toastInfo}
`;

const RightArea = styled.div`
  text-align: right;
`;

const Toast = ({
  danger = false,
  delay = 250,
  duration = 5000,
  success = false,
  info = false,
  title = null,
  message,
  id,
}: ToastProps) => {
  const { removeToast } = useToasts();
  const [visible, setVisible] = useState<boolean>(false);
  const isMounted = useMountedState();
  const showToast = () => {
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);

    window.setTimeout(() => {
      if (isMounted) {
        removeToast(id);
      }
    }, 150);
  };

  useTimeoutFn(showToast, delay);
  useTimeoutFn(handleClose, delay + duration);

  return (
    <ToastContainer visible={visible} success={success} danger={danger} info={info} role="status">
      <div>
        {title && <Text bold>{title}</Text>}

        <Text>{message}</Text>
      </div>

      <RightArea>
        <IconButton onClick={handleClose}>X</IconButton>
      </RightArea>
    </ToastContainer>
  );
};

export default Toast;
