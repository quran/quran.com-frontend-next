import { useTranslation } from 'next-i18next';

import TafsirMessage from './TafsirMessage';

type TafsirGroupMessageProps = {
  from: string;
  to: string;
};

const TafsirGroupMessage = ({ from, to }: TafsirGroupMessageProps) => {
  const { t } = useTranslation('common');
  return (
    <TafsirMessage>
      {t('tafsir.group-message', {
        from,
        to,
      })}
    </TafsirMessage>
  );
};

export default TafsirGroupMessage;
