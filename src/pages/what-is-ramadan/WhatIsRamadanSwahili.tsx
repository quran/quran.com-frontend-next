/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
import classNames from 'classnames';

import InlineLink from '@/components/RamadanActivity/InlineLink';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import styles from '@/pages/contentPage.module.scss';
import pageStyles from '@/pages/ramadan/RamadanActivities.module.scss';
import { logButtonClick } from '@/utils/eventLogger';

const WhatIsRamadanSwahili = (): JSX.Element => {
  const onStartReadingClicked = () => {
    logButtonClick('ramadan_start_reading');
  };

  return (
    <div className={classNames(pageStyles.container, styles.contentPage)}>
      <h1>Ramadhani: Safari ya Kutafakari, Kufufua Imani, na Kuungana na Qur'ani.</h1>
      <div className={styles.subSection}>
        <h2>Ramadhani ni nini?</h2>
        <div>
          Katikati ya Ramadhani kuna Qur'ani, kitabu kitakatifu cha Uislamu. Iliyofunuliwa zaidi ya
          miaka 1,400 iliyopita wakati wa mwezi huu mtukufu, Qur'ani ni zaidi ya andiko tu; ni
          mwongozo wa maisha, unaotoa hekima, faraja, na majibu ya maswali ya ndani kabisa ya
          maisha. Kwa Waislamu, Ramadhani si kuhusu kufunga tu; ni kuhusu kuungana tena na ujumbe wa
          Qur'ani usio na wakati na kuuruhusu kufanya upya na kubadilisha mioyo na akili zao.
        </div>
      </div>
      <div className={styles.subSection}>
        <h2>Dawa ya Kuzingatia</h2>
        <div className={pageStyles.mainVerse}>
          <div>
            <i>
              "Enyi mlio amini! Mmeandikiwa Saumu, kama waliyo andikiwa walio kuwa kabla yenu ili
              mpate kuchamngu."
            </i>
          </div>
          [Qur'ani <InlineLink text="2:183" href="/2:183" />]
        </div>
        <div className={styles.subSection}>
          Hebu fikiria mwezi mzima umetengwa kwa sababu ya kulisha roho yako, kukuza shukrani,
          kupinga ubinafsi na kuungana tena na Muumba wako. Ramadhani ni mwezi huo kwa zaidi ya
          Waislamu bilioni 1.8 duniani kote. Ni mwezi wa tisa wa kalenda ya Kiislamu, kipindi
          kitakatifu cha kufunga, sala, na kutafakari. Kuanzia alfajiri hadi machweo, Waislamu
          hujiepusha na chakula, vinywaji, na mahusiano ya kimapenzi ili kuzingatia ukuaji wa kiroho
          na nidhamu binafsi. Lakini Ramadhani ni zaidi ya kujiepusha; ni kuhusu kuungana—na Mungu,
          na jamii ya mtu, na ujumbe mtakatifu wa Qur'ani. Mungu anatuambia katika Qur'ani,
        </div>
        <div className={styles.subSection}>
          <div>
            <i>
              "Mwezi wa Ramadhani ambao imeteremshwa humo Qur'ani kuwa ni uwongofu kwa watu, na hoja
              zilizo wazi za uwongofu na upambanuzi. Basi ataye kuwa mjini katika mwezi huu
              naafunge. Na mwenye kuwa mgonjwa au safarini, basi atimize hisabu katika siku
              nyengine. Mwenyezi Mungu anakutakieni yaliyo mepesi wala hakutakieni yaliyo mazito, na
              mtimize hiyo hisabu, na mumtukuze Mwenyezi Mungu kwa kuwa amekuongoeni ili mpate
              kushukuru."
            </i>
          </div>
          (Qur'ani <InlineLink text="2:185" href="/2:185" />)
        </div>
      </div>
      <div className={styles.subSection}>
        <h2>Mapumziko ya Kina na Mwanzo Mpya wa Kiroho</h2>
        <div>
          Je, umewahi kuhisi hitaji la kusitisha machafuko ya maisha na kuanza upya Kiroho?
          Ramadhani ni fursa nzuri. Mwezi huu ulichaguliwa na Mungu kumfunulia Qur'ani, Mtume
          Muhammad (rehema na amani zimshukie) kitabu kitakatifu cha Uislamu. Muunganisho huu wa
          kimungu hufanya Ramadhani kuwa wakati wa kiroho na kusudi lililotiwa mkazo.
        </div>
        <div className={styles.subSection}>
          Kufunga wakati wa Ramadhani kuna faida nyingi za ziada kwa moyo na roho - kuongezeka kwa
          huruma kwa wale wanaohitaji, shukrani kwa baraka, na nidhamu dhidi ya matamanio. Lakini
          sio tu kuhusu kufunga kimwili - ni kufunga kwa moyo na roho kutokana na mambo hasi na
          kutojali, na uwekaji upya wa akili na roho.
        </div>
      </div>
      <div className={styles.subSection}>
        <h2>Qur'ani: Moyo wa Ramadhani</h2>
        <div>
          Kinachofanya Ramadhani kuwa ya kipekee ni uhusiano wake wa karibu na Qur'ani.
          Iliyofunuliwa zaidi ya miaka 1,400 iliyopita, Qur'ani ni neno la moja kwa moja la Mungu.
          Sio kitabu tu bali mwongozo wa maisha, unaotoa hekima, faraja, na majibu ya maswali ya
          ndani kabisa ya maisha.
        </div>
        <div className={styles.subSection}>
          Katika Ramadhani, Waislamu hutumia muda zaidi kusoma, kukariri, na kutafakari Qur'ani.
          Sala maalum za usiku zinazoitwa Taraweeh hufanyika, ambapo Qur'ani husomwa kwa sauti nzuri
          za kimuziki. Kuzama kwa kina huku katika ujumbe wa Qur'ani kunainua Ramadhani kutoka
          kuangaliwa tu kitakatifu kuwa safari ya kina ya kujigundua, upya wa kiroho, na kuungana
          tena na Mungu, kutoa nafasi ya kuacha tabia mbaya, kurekebisha upya roho, na kuanza upya.
        </div>
      </div>
      <div className={styles.subSection}>
        <h2>Ramadhani Inaweza Kukufundisha Nini?</h2>
        <div>
          Hata kama wewe si Muislamu, Ramadhani ina masomo ya ulimwengu mzima. Je, umewahi kujiuliza
          ina maana gani kuishi kwa uangalifu? Kufanya shukrani hata wakati wa changamoto? Kutafuta
          uwazi kuhusu nafasi yako ulimwenguni? Haya ni maswali ambayo Ramadhani inatualika sote
          kutafakari.
        </div>
        <div className={styles.subSection}>
          <ul>
            <li>
              Nini kingetokea ukisimama wakati fulani siku nzima kuonyesha shukrani kwa Muumba wako?
            </li>
            <li>Siku ya kufunga—au hata tu kuondoa usumbufu—inawezaje kubadilisha mtazamo wako?</li>
            <li>Je, unaweza kugundua nini kuhusu nafsi yako kwa kuchunguza Qur'ani?</li>
          </ul>
        </div>
      </div>
      <div className={styles.subSection}>
        <h2>Pata Nguvu ya Qur'ani</h2>
        <div>
          Qur'ani si kitabu tu kwa Waislamu; ni chemchemi ya hekima na msukumo kwa mtu yeyote
          anayekuja kwake kwa moyo ulio wazi. Iwe unatafuta amani, majibu, au uelewa wa kina wa
          kusudi la maisha, Qur'ani inazungumza na roho ya binadamu kwa njia zinazopita tamaduni na
          wakati.
        </div>
        <div className={styles.subSection}>
          Unapochunguza Qur'ani, utakutana na mawazo ya kina kuhusu haki, huruma, uvumilivu, na
          uzuri wa uumbaji. Qur'ani inatutia changamoto kufikiri kwa kina, kutafakari, na kutenda
          kwa huruma. Je, hii inaweza kuwa ujumbe ambao roho yako imekuwa ikiusubiri?
        </div>
      </div>
      <div className={styles.subSection}>
        <h2>Mwaliko Wako</h2>
        <div>
          Tunakualika kuchukua hatua ya kwanza katika safari hii. Chunguza Quran.com kupata uzoefu
          wa Qur'ani mwenyewe. Sikiliza usomaji wake, soma maana yake, na ugundue jinsi mwongozo
          wake wa milele unavyoweza kuangazia njia yako.
        </div>
        <div className={styles.subSection}>
          Ramadhani ni ukumbusho kwamba lishe ya roho ni muhimu kama lishe ya mwili. Iwe unafunga au
          una shauku tu, mwezi huu unatoa nafasi ya kutafakari, kuendelea upya, na kuungana tena.
          Nini kinachoweza kuwa na nguvu zaidi kuliko mwanzo mpya kwa roho yako?
        </div>
      </div>
      <div className={styles.subSection}>
        <h2>Gundua. Tafakari. Anza.</h2>
        <div>
          Acha Ramadhani hii iwe lango lako la kuchunguza athari kubwa ya Qur'ani. Hakuna ajuaye,
          wakati huu wa udadisi unaweza kuwa mwanzo wa safari inayobadilisha maisha yako.
        </div>
      </div>
      <div className={styles.subSection}>
        Umevutiwa kujifunza zaidi kuhusu Qur'ani? Tembelea:{' '}
        <InlineLink text="Kuhusu Qur'ani" href="/about-the-quran" />
      </div>
      <div className={styles.ctaContainer}>
        <Button
          onClick={onStartReadingClicked}
          variant={ButtonVariant.Shadow}
          href="/al-fatihah"
          className={styles.button}
        >
          Anza kusoma Qur'ani
        </Button>
      </div>
    </div>
  );
};

export default WhatIsRamadanSwahili;
