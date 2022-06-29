/* eslint-disable i18next/no-literal-string */

import Button from '../dls/Button/Button';
import Carousel from '../dls/Carousel/Carousel';

import styles from './WelcomeMessageModalBody.module.scss';
import Slide1 from './WelcomeMessageSlides/Slide1';
import Slide2 from './WelcomeMessageSlides/Slide2';
import Slide3 from './WelcomeMessageSlides/Slide3';

type WelcomeMessageModalBodyProps = {
  onCompleted: () => void;
};
const WelcomeMessageModalBody = ({ onCompleted }: WelcomeMessageModalBodyProps) => {
  return (
    <div className={styles.container}>
      <Carousel
        items={[
          {
            id: 'announcement-slide-1',
            component: (
              <Slide1 action={<Button href="#announcement-slide-2">{`See what's new`}</Button>} />
            ),
          },
          {
            id: 'announcement-slide-2',
            component: <Slide2 action={<Button href="#announcement-slide-3">Next</Button>} />,
          },
          {
            id: 'announcement-slide-3',
            component: (
              <Slide3
                action={
                  <Button href="#announcement-slide-3" onClick={onCompleted}>
                    Okay, got it
                  </Button>
                }
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default WelcomeMessageModalBody;
