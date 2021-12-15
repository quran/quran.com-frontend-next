import classNames from 'classnames';

import styles from './Blocks.module.scss';

import Text from 'src/components/Changelog/Text';

export const renderBlock = (block, pageTitle: string) => {
  const { type } = block;
  const value = block[type];
  switch (type) {
    case 'paragraph':
      return (
        <p className={styles.paragraph}>
          <Text text={value.text} />
        </p>
      );
    case 'image': {
      const src = value.type === 'external' ? value.external.url : value.file.url;
      const caption = value.caption[0]?.plain_text || pageTitle;
      return (
        <div className={styles.imageContainer}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.image} src={src} alt={caption} />
        </div>
      );
    }
    case 'bulleted_list_item':
    case 'numbered_list_item':
      return (
        <li className={styles.list}>
          <Text text={value.text} />
        </li>
      );
    case 'heading_1':
      return (
        <h1 className={classNames(styles.h1, styles.bold, styles.heading)}>
          <Text text={value.text} />
        </h1>
      );
    case 'heading_2':
      return (
        <h2 className={classNames(styles.h2, styles.bold, styles.heading)}>
          <Text text={value.text} />
        </h2>
      );
    case 'heading_3':
      return (
        <h3 className={classNames(styles.heading, styles.bold)}>
          <Text text={value.text} />
        </h3>
      );
    default:
      return <></>;
  }
};

interface Props {
  blocks: any[];
  pageTitle: string;
}

const Blocks: React.FC<Props> = ({ blocks, pageTitle }) => {
  return (
    <>
      {blocks.map((block) => (
        <div key={block.id}>{renderBlock(block, pageTitle)}</div>
      ))}
    </>
  );
};

export default Blocks;
