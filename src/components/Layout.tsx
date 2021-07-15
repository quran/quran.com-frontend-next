import { ReactNode } from 'react';
import useTranslation from 'next-translate/useTranslation';

interface Props {
  children: ReactNode | ReactNode[];
}

const Layout: React.FC<Props> = ({ children }) => {
  const { lang } = useTranslation();

  return <main dir={lang === 'ar' ? 'rtl' : 'ltr'}>{children}</main>;
};

export default Layout;
