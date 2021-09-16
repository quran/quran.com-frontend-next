/* eslint-disable react/jsx-no-target-blank */ // eslint failed to lint properly
import NextLink from 'next/link';
import classNames from 'classnames';
import Wrapper from 'src/components/Wrapper/Wrapper';
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
  <Wrapper shouldWrap={!download} wrapper={(node) => <NextLink href={href}>{node}</NextLink>}>
    <NextLink href={href}>
      <a
        href={download ? href : undefined}
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
  </Wrapper>
);

export default Link;
