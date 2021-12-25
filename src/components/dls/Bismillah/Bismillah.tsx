/* eslint-disable i18next/no-literal-string */
import React from 'react';

import classNames from 'classnames';

import BismillahSVG from '../../../../public/fonts/bismillah/bismillah.svg';

export enum BismillahSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

type BismillahProps = {
  size?: BismillahSize;
};

const Bismillah = ({ size = BismillahSize.Medium }: BismillahProps) => <BismillahSVG />;

export default Bismillah;
