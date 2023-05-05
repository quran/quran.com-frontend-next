import { Provider } from 'react-redux';

import Footer from './Footer';

import getStore from '@/redux/store';

export default {
  title: 'dls/Footer',
  component: Footer,
};

export const Preview = () => (
  <Provider store={getStore('en')}>
    <span className="previewWrapper">
      <Footer />
    </span>
  </Provider>
);
