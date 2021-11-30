import classNames from 'classnames';

import styles from './Blocks.module.scss';

import Text from 'src/components/Changelog/Text';

export const getPageTitle = (page) => (!page ? null : page.properties.Name.title[0].plain_text);

export const renderBlock = (block) => {
  const { type } = block;
  const value = block[type];
  switch (type) {
    case 'paragraph':
      return (
        <p>
          <Text text={value.text} />
        </p>
      );
    case 'image': {
      const src = value.type === 'external' ? value.external.url : value.file.url;
      const caption = value.caption[0]?.plain_text || '';
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
        <li>
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
}

const Blocks: React.FC<Props> = ({ blocks }) => {
  return (
    <>
      {blocks.map((block) => (
        <div key={block.id}>{renderBlock(block)}</div>
      ))}
    </>
  );
};

export default Blocks;
