import classNames from 'classnames';

import styles from './Text.module.scss';

import Link from 'src/components/dls/Link/Link';

interface Props {
  text: any;
}

const Text: React.FC<Props> = ({ text }) => {
  if (!text) {
    return null;
  }
  return text.map((value) => {
    const {
      annotations: { bold, color, italic, strikethrough, underline },
    } = value;
    return (
      <span
        className={classNames({
          [styles.bold]: bold,
          [styles.italic]: italic,
          [styles.strikethrough]: strikethrough,
          [styles.underline]: underline,
        })}
        style={color !== 'default' ? { color } : {}}
      >
        {value.text.link ? (
          <Link href={text.link.url} newTab>
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
