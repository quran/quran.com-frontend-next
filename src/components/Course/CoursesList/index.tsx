import React from 'react';

import styles from './LessonsList.module.scss';

import Card, { CardSize } from '@/dls/Card/Card';
import Link from '@/dls/Link/Link';
import SearchIcon from '@/icons/search.svg';
import { Course } from '@/types/auth/Course';
import { getLessonNavigationUrl } from '@/utils/navigation';

type Props = {
  courses: Course[];
};

const CoursesList: React.FC<Props> = ({ courses }) => {
  return (
    <div className={styles.container}>
      {courses.map((course) => {
        return (
          <Link key={course.id} href={getLessonNavigationUrl(course.slug)}>
            <Card
              imgSrc={course.image}
              key={course.id}
              title={course.title}
              imgAlt={course.title}
              size={CardSize.Medium}
              actionIcon={<SearchIcon />}
            />
          </Link>
        );
      })}
    </div>
  );
};

export default CoursesList;
