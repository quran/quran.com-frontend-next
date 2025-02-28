import React from 'react';

import classNames from 'classnames';

import styles from './Card.module.scss';

import Link from '@/dls/Link/Link';

interface CardProps {
  children: React.ReactNode;
  link?: string;
  isNewTab?: boolean;
  className?: string;
  linkClassName?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  link,
  isNewTab = false,
  className,
  linkClassName,
  onClick,
}) => {
  if (link) {
    return (
      <Link href={link} isNewTab={isNewTab} className={linkClassName} onClick={onClick}>
        <div className={classNames(className, styles.card, styles.cardWithLink)}>{children}</div>
      </Link>
    );
  }

  return <div className={classNames(className, styles.card)}>{children}</div>;
};

export default Card;
