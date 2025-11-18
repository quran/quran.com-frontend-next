import classNames from 'classnames';
import Image from 'next/image';

import styles from './Blocks.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';
import { getImageUrl } from '@/lib/sanity';

type Props = {
  page: any;
};

const PageBlocks: React.FC<Props> = ({ page }) => {
  const { body } = page;
  const [bodyObject] = body;
  const { body: bodyElements } = bodyObject;
  return bodyElements.map((bodyElement) => {
    const { _key: bodyElementKey, children, markDefs, listItem, level } = bodyElement;
    const isList = !!listItem;
    const elementBlocks = [];
    children.forEach((childElement) => {
      const { marks, text: originalChildElementWithMarksText } = childElement;
      if (marks.length) {
        marks.forEach((markKey) => {
          // eslint-disable-next-line no-underscore-dangle
          const markDefinition = markDefs.filter((markDef) => markDef._key === markKey);
          // replace the child with the markDefinition since it contains the actual details of the child
          if (markDefinition[0]) {
            // eslint-disable-next-line no-param-reassign
            childElement = markDefinition[0];
          }
        });
      }
      const { _type: childElementType, _key: childElementKey, text } = childElement;
      if (childElementType === 'inlineImage') {
        const { asset, _key: imageKey } = childElement;
        const width = asset?.metadata?.dimensions?.width ?? 800;
        const height = asset?.metadata?.dimensions?.height ?? 600;
        const imageUrl = getImageUrl(asset);
        if (!imageUrl) {
          return;
        }
        elementBlocks.push(
          <div
            key={`${bodyElementKey}-${childElementKey}-${imageKey}`}
            className={styles.imageContainer}
          >
            <Image
              className={styles.image}
              src={imageUrl}
              alt=""
              width={width}
              height={height}
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>,
        );
        return;
      }
      if (childElementType === 'link') {
        const { href, url, _key: linkKey } = childElement;
        elementBlocks.push(
          <span
            className={styles.paragraph}
            key={`${bodyElementKey}-${childElementKey}-${linkKey}`}
          >
            <Link href={href || url} isNewTab variant={LinkVariant.Highlight}>
              {originalChildElementWithMarksText}
            </Link>
          </span>,
        );
        return;
      }
      if (isList) {
        elementBlocks.push(
          <li
            className={classNames(styles.list, styles[`li-${level}`])}
            key={`${bodyElementKey}-${childElementKey}`}
          >
            {text}
          </li>,
        );
        return;
      }
      if (text === '') {
        elementBlocks.push(<br key={`${bodyElementKey}-${childElementKey}`} />);
        return;
      }
      elementBlocks.push(
        <span className={styles.paragraph} key={`${bodyElementKey}-${childElementKey}`}>
          {text}
        </span>,
      );
    });
    return <div key={bodyElementKey}>{elementBlocks}</div>;
  });
};

export default PageBlocks;
