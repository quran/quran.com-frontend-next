import React from 'react';

import Spinner, { SpinnerSize } from 'src/components/dls/Spinner/Spinner';

const GateLoader = () => {
  return <Spinner size={SpinnerSize.Large} />;
};

export default GateLoader;
