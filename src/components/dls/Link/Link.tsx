import NextLink from 'next/link';
import classNames from 'classnames';
import styles from './Link.module.scss';

export enum LinkVariant {
  Highlight = 'highlight',
  Primary = 'primary',
  Secondary = 'secondary',
  Blend = 'blend',
}

type LinkProps = {
  href: string;
  variant?: LinkVariant;
};

const Link: React.FC<LinkProps> = ({ href, children, variant }) => (
  <NextLink href={href}>
    <a
      className={classNames(styles.base, {
        [styles.highlight]: variant === LinkVariant.Highlight,
        [styles.primary]: variant === LinkVariant.Primary,
        [styles.secondary]: variant === LinkVariant.Secondary,
        [styles.blend]: variant === LinkVariant.Blend,
      })}
    >
      {children}
    </a>
  </NextLink>
);

export default Link;
