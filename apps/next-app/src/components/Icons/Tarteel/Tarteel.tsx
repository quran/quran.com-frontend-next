import React from 'react';

import { ReactComponent as TarteelSVG } from './tarteel.svg';
import { ReactComponent as TarteelTextSVG } from './tarteel-text.svg';

const Tarteel = () => <TarteelSVG height="50px" width="40px" />;

const TarteelText = () => <TarteelTextSVG />;

// eslint-disable-next-line import/no-anonymous-default-export
export { Tarteel, TarteelText };
