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
  newTab?: boolean;
  download?: string;
};

const Link: React.FC<LinkProps> = ({ href, children, newTab = false, variant, download }) => (
  <NextLink href={href}>
    <a
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
  </NextLink>
);

export default Link;
