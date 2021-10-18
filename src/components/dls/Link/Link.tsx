/* eslint-disable react/jsx-no-target-blank */ // eslint failed to lint properly
import classNames from 'classnames';
import NextLink from 'next/link';

import styles from './Link.module.scss';

import Wrapper from 'src/components/Wrapper/Wrapper';

export enum LinkVariant {
  Highlight = 'highlight',
  Primary = 'primary',
  Secondary = 'secondary',
  Blend = 'blend',
}

type LinkProps = {
  href: string;
  variant?: LinkVariant;
  newTab?: boolean;
  download?: string;
  prefetch?: boolean;
};

const Link: React.FC<LinkProps> = ({
  href,
  children,
  newTab = false,
  variant,
  download,
  prefetch = true,
}) => (
  <Wrapper
    shouldWrap={!download}
    wrapper={(node) => (
      <NextLink href={href} prefetch={prefetch}>
        {node}
      </NextLink>
    )}
  >
    <a
      href={href}
      download={download}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noreferrer' : undefined}
      className={classNames(styles.base, {
        [styles.highlight]: variant === LinkVariant.Highlight,
        [styles.primary]: variant === LinkVariant.Primary,
        [styles.secondary]: variant === LinkVariant.Secondary,
        [styles.blend]: variant === LinkVariant.Blend,
      })}
    >
      {children}
    </a>
  </Wrapper>
);

export default Link;
