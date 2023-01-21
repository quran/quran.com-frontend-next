/* eslint-disable react/jsx-no-target-blank */ // eslint failed to lint properly
import classNames from 'classnames';
import NextLink from 'next/link';

import styles from './Link.module.scss';

import Wrapper from '@/components/Wrapper/Wrapper';

export enum LinkVariant {
  Highlight = 'highlight',
  Primary = 'primary',
  Secondary = 'secondary',
  Blend = 'blend',
}

type LinkProps = {
  href: string;
  variant?: LinkVariant;
  isNewTab?: boolean;
  download?: string;
  className?: string;
  onClick?: React.MouseEventHandler;
  shouldPassHref?: boolean;
  isShallow?: boolean;
  shouldPrefetch?: boolean;
  title?: string;
  children?: React.ReactNode;
  ariaLabel?: string;
};

const Link: React.FC<LinkProps> = ({
  href,
  children,
  isNewTab = false,
  variant,
  download,
  className,
  onClick,
  shouldPassHref,
  isShallow = false,
  shouldPrefetch = true,
  title,
  ariaLabel,
}) => (
  <Wrapper
    shouldWrap={!download}
    wrapper={(node) => (
      <NextLink
        href={href}
        {...(shouldPassHref && { shouldPassHref })}
        {...(shouldPrefetch === false && { prefetch: false })}
        shallow={isShallow}
      >
        {node}
      </NextLink>
    )}
  >
    <a
      href={href}
      download={download}
      target={isNewTab ? '_blank' : undefined}
      rel={isNewTab ? 'noreferrer' : undefined}
      className={classNames(styles.base, className, {
        [styles.highlight]: variant === LinkVariant.Highlight,
        [styles.primary]: variant === LinkVariant.Primary,
        [styles.secondary]: variant === LinkVariant.Secondary,
        [styles.blend]: variant === LinkVariant.Blend,
      })}
      {...(onClick && { onClick })}
      {...(title && { title })}
      // eslint-disable-next-line @typescript-eslint/naming-convention
      {...(ariaLabel && { 'aria-label': ariaLabel })}
    >
      {children}
    </a>
  </Wrapper>
);

export default Link;
