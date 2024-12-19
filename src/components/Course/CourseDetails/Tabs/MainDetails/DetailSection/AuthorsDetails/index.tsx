import React from 'react';

import styles from './AuthorsDetails.module.scss';

import { CourseAuthor } from '@/types/auth/Course';

type Props = {
  authors: { author: CourseAuthor }[];
};

const AuthorsDetails: React.FC<Props> = ({ authors }) => {
  return (
    <>
      {authors.map((author) => {
        const authorDetails = author.author;
        return (
          <li key={authorDetails.id}>
            <span className={styles.author}>{authorDetails.name}</span>{' '}
            <span>{authorDetails.biography}</span>
          </li>
        );
      })}
    </>
  );
};

export default AuthorsDetails;
