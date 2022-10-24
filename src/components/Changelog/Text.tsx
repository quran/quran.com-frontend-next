import classNames from 'classnames';

import styles from './Text.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';

interface Props {
  text: any;
}

const Text: React.FC<Props> = ({ text }) => {
  if (!text) {
    return null;
  }
  return text.map((value, index) => {
    const {
      annotations: { bold, color, italic, strikethrough, underline },
    } = value;
    return (
      <span
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className={classNames({
          [styles.bold]: bold,
          [styles.italic]: italic,
          [styles.strikethrough]: strikethrough,
          [styles.underline]: underline,
        })}
        style={color !== 'default' ? { color } : {}}
      >
        {value.text.link ? (
          <Link
            href={value.text.link.url}
            variant={LinkVariant.Highlight}
            isNewTab
            shouldPrefetch={false}
          >
            {value.text.content}
          </Link>
        ) : (
          value.text.content
        )}
      </span>
    );
  });
};

export default Text;
