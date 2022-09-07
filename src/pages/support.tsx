/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { NextPage } from 'next';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './contentPage.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';

const PATH = '/support';
const SupportPage: NextPage = (): JSX.Element => {
  const { t, lang } = useTranslation('support');
  return (
    <>
      <NextSeoWrapper
        title={t('support')}
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
      />
      <PageContainer>
        <div className={styles.contentPage}>
          <h1>{t('header')}</h1>
          <p>
            <Trans
              i18nKey="support:main-desc"
              components={[
                <a key={0} target="_blank" href="https://feedback.quran.com/" rel="noreferrer" />,
              ]}
            />
          </p>
          <h2>{t('download-q')}</h2>
          <p>{t('download-a')}</p>
          <h2>{t('other-languages-q')}</h2>
          <p>{t('other-languages-a')}</p>
          <h2>{t('bug-q')}</h2>
          <p>
            <Trans
              i18nKey="support:bug-a"
              components={[
                <a key={0} target="_blank" href="https://feedback.quran.com/" rel="noreferrer" />,
              ]}
            />
          </p>
          <h2>{t('site-down-q')}</h2>
          <p>
            <Trans
              i18nKey="support:site-down-a"
              components={[
                <a key={0} target="_blank" href="https://feedback.quran.com/" rel="noreferrer" />,
              ]}
            />
          </p>
          <h2>{t('developer-q')}</h2>
          <p>
            <Trans
              i18nKey="support:developer-a"
              components={[
                <Link
                  key={0}
                  href="/developers"
                  variant={LinkVariant.Blend}
                  shouldPrefetch={false}
                />,
              ]}
            />
          </p>
          <h2>{t('fiqh-q')}</h2>
          <p>{t('fiqh-a')}</p>
          <h2>{t('tafsir-q')}</h2>
          <p>{t('tafsir-a')}</p>
          <h2>{t('translations-q')}</h2>
          <p>
            <Trans
              i18nKey="support:translations-a"
              components={[
                <a key={0} href="https://feedback.quran.com/" target="_blank" rel="noreferrer" />,
              ]}
            />
          </p>
          <h2>{t('reciters-q')}</h2>
          <p>
            <Trans
              i18nKey="support:reciters-a"
              components={[
                <a key={0} target="_blank" href="https://feedback.quran.com/" rel="noreferrer" />,
              ]}
            />
          </p>
          <h2>{t('mobile-q')}</h2>
          <p>
            <Trans
              i18nKey="support:mobile-a"
              components={[<Link key={0} href="/apps" shouldPrefetch={false} />]}
            />
          </p>
          {/* <h2>
        <Trans i18nKey="support:donate-q" />
      </h2>
      <p>
        <Trans
          i18nKey="support:donate-a"
          components={[<Link href="/donations" variant={LinkVariant.Blend} prefetch={false} />]}
        />
      </p> */}
        </div>
      </PageContainer>
    </>
  );
};

export default SupportPage;
