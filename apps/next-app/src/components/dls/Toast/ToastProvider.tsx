import { useState } from 'react';

import dynamic from 'next/dynamic';

import ToastContext from './ToastContext';

const ToastContainer = dynamic(() => import('./Toast').then((toast) => toast.ToastContainer), {
  ssr: false,
});

type ToastContainerProviderProps = {
  children: React.ReactNode;
};
const ToastContainerProvider = ({ children }: ToastContainerProviderProps) => {
  const [shouldRenderToast, setShouldRenderToast] = useState(false);
  return (
    <ToastContext.Provider value={setShouldRenderToast}>
      {children}
      {shouldRenderToast && <ToastContainer />}
    </ToastContext.Provider>
  );
};

export default ToastContainerProvider;
