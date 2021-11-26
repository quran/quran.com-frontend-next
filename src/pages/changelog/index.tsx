import React from 'react';

import classNames from 'classnames';
import { GetStaticProps, NextPage } from 'next';

import styles from './changelog.module.scss';

import Text from 'src/components/Changelog/Text';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import { retrieveBlockChildren, retrieveDatabase } from 'src/lib/notion';
import Error from 'src/pages/_error';
import {
  ONE_DAY_REVALIDATION_PERIOD_SECONDS,
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
} from 'src/utils/staticPageGeneration';

interface Props {
  hasError?: boolean;
  pages?: any[];
  pagesBlocks?: any[];
}

const Changelog: NextPage<Props> = ({ pages, pagesBlocks, hasError }) => {
  if (hasError) {
    return <Error statusCode={500} />;
  }
  const renderBlock = (block) => {
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

  return (
    <>
      <NextSeoWrapper title="Product updates" />
      <div className={styles.container}>
        {pages.map((page, index) => {
          const pageBlocks = pagesBlocks[index];
          const date = new Date(page.properties.Date.date.start).toLocaleString('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric',
          });
          return (
            <div key={page.id} className={styles.pageContainer}>
              <div className={styles.headerSection}>
                <p className={styles.date}>{date}</p>
                <p className={classNames(styles.title, styles.bold)}>
                  {page.properties.Name.title[0].plain_text}
                </p>
              </div>
              {pageBlocks.map((block) => (
                <div key={block.id}>{renderBlock(block)}</div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  try {
    // 1. get the list of pages by querying the database.
    const pages = await retrieveDatabase(process.env.NOTION_DATABASE_ID);
    const promises = [];
    // 2. we need to get the blocks of each page (which is considered a block itself)
    pages.forEach((page) => {
      promises.push(retrieveBlockChildren(page.id));
    });
    // 3. wait for all the requests.
    const pagesBlocks = await Promise.all(promises);
    return {
      props: {
        pages,
        pagesBlocks,
      },
      revalidate: ONE_DAY_REVALIDATION_PERIOD_SECONDS,
    };
  } catch (error) {
    return {
      props: {
        hasError: true,
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS, // 35 seconds will be enough time before we re-try generating the page again.
    };
  }
};

export default Changelog;
