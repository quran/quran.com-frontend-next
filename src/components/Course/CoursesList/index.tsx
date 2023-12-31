import React from 'react';

import styles from './LessonsList.module.scss';

import Card, { CardSize } from '@/dls/Card/Card';
import Link from '@/dls/Link/Link';
import SearchIcon from '@/icons/search.svg';
import { Course } from '@/types/auth/Course';
import { getCourseNavigationUrl } from '@/utils/navigation';

type Props = {
  courses: Course[];
};

const CoursesList: React.FC<Props> = ({ courses }) => {
  return (
    <div className={styles.container}>
      {courses.map((course) => {
        return (
          <Link className={styles.link} key={course.id} href={getCourseNavigationUrl(course.slug)}>
            <Card
              shouldShowFullTitle
              imgSrc={course.image}
              key={course.id}
              title={course.title}
              imgAlt={course.title}
              size={CardSize.Medium}
              actionIcon={<SearchIcon />}
              className={styles.cardContainer}
            />
          </Link>
        );
      })}
    </div>
  );
};

export default CoursesList;
