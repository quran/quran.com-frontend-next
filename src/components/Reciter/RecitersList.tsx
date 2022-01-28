import Card, { CardSize } from '../dls/Card/Card';

import styles from './RecitersList.module.scss';

import { getImageCDNPath } from 'src/api';
import Link from 'src/components/dls/Link/Link';
import { getReciterNavigationUrl } from 'src/utils/navigation';
import Reciter from 'types/Reciter';

type RecitersListProps = {
  reciters: Reciter[];
};

const RecitersList = ({ reciters }: RecitersListProps) => {
  return (
    <div className={styles.container}>
      {reciters.map((reciter) => {
        return (
          <Link key={reciter.id} href={getReciterNavigationUrl(reciter.id.toString())}>
            <Card
              imgSrc={getImageCDNPath(reciter.profilePicture)}
              key={reciter.id}
              title={reciter.name}
              description={reciter.style.name}
              size={CardSize.Medium}
            />
          </Link>
        );
      })}
    </div>
  );
};

export default RecitersList;
