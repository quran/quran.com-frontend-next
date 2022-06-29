import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';

import { toast } from './Toast';
import ToastContext from './ToastContext';

const ToastContainer = dynamic(() => import('./Toast').then((toaster) => toaster.ToastContainer), {
  ssr: false,
});

type ToastContainerProviderProps = {
  children: React.ReactNode;
};
const ToastContainerProvider = ({ children }: ToastContainerProviderProps) => {
  const [shouldRenderToast, setShouldRenderToast] = useState(false);
  useEffect(() => {
    window.toast = (...args) => {
      setShouldRenderToast(true);
      toast(...args);
    };
  }, []);
  return (
    <ToastContext.Provider value={setShouldRenderToast}>
      {children}
      {shouldRenderToast && <ToastContainer />}
    </ToastContext.Provider>
  );
};

export default ToastContainerProvider;
