import React from 'react';

import styles from './AuthorsDetails.module.scss';

import { CourseAuthor } from '@/types/auth/Course';

type Props = {
  authors: { author: CourseAuthor }[];
};

const AuthorsDetails: React.FC<Props> = ({ authors }) => {
  return (
    <ul className={styles.list}>
      {authors.map(({ author }) => (
        <li key={author.id}>
          <span className={styles.author}>{author.name}</span> {author.biography}
        </li>
      ))}
    </ul>
  );
};

export default AuthorsDetails;
