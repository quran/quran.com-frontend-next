import React from 'react';

import styles from './AuthorDetail.module.scss';

import { CourseAuthor } from '@/types/auth/Course';

type Props = {
  author: CourseAuthor;
};

const AuthorDetail: React.FC<Props> = ({ author }) => {
  return (
    <>
      <span className={styles.author}>{author.name}</span> <span>{author.biography}</span>
    </>
  );
};

export default AuthorDetail;
