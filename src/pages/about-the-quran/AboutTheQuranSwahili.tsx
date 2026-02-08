/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
import pageStyles from './about-the-quran.module.scss';

import PlainVerseText from '@/components/Verse/PlainVerseText';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import Link, { LinkVariant } from '@/dls/Link/Link';
import styles from '@/pages/contentPage.module.scss';
import { logButtonClick } from '@/utils/eventLogger';
import verse3829 from 'src/data/verses/verse3829';

const AboutTheQuranSwahili = (): JSX.Element => {
  const onStartReadingClicked = () => {
    logButtonClick('about_quran_start_reading');
  };

  return (
    <div className={styles.contentPage}>
      <div className={styles.section}>
        <h1>Qur'ani ni nini?</h1>
        <div>
          Jibu la kawaida ni kwamba Qur'ani ni kitabu – lakini si kama vitabu vingine. Imetungwa kwa
          maneno yenye ukweli na mwongozo kwa kila mwanadamu, na Waislamu wanaamini kwamba haya ni
          maneno yaliyoteremshwa moja kwa moja na Mungu, kwa lugha ya Kiarabu, kwa Mtume na Mjumbe
          Wake wa mwisho, Muhammad ﷺ (rehma na amani zimshukie).
        </div>
        <div>
          Qur'ani inajieleza kwa majina na sifa kadhaa zinazostahili kutafakariwa. Hapa tutataja
          machache:
        </div>
        <ul>
          <li>
            Qur'ani na Kitabu (Kisomo na Maandishi): la kwanza lina maana ya kitu kinachosomwa kwa
            sauti, na la pili lina maana ya kitu kilichoandikwa. Hii inaelezea njia mbili kuu ambazo
            mtu anaweza kupata tajriba na andiko hili, na ambazo unaweza kuwasiliana nazo kwenye
            tovuti hii.
          </li>
          <li>
            Kalam Allah (Hotuba ya Kimungu): hii ina maana kwamba haya ni maneno ya mawasiliano ya
            moja kwa moja kutoka kwa Muumba na Mola wa kila kiumbe hai. Yanachukua kiwango cha juu
            kabisa cha mamlaka kwa waumini wake, na yanafafanuliwa na kuungwa mkono na mafundisho ya
            Mtume ﷺ. Ingawa lugha ya ufunuo huu maalumu ilikuwa Kiarabu, pia tunazo tarjuma nyingi
            katika lugha tofauti zinazotusaidia kuelewa maana zake.
          </li>
          <li>
            Dhikr na Huda (Ukumbusho na Mwongozo): Qur'ani hutumiwa kama njia ya kuungana na Mungu
            na kumweka mioyoni mwetu na kwenye ndimi zetu. Pia kimsingi ni mwongozo kwa maisha yetu
            binafsi na kwa maisha ya jumuiya na jamii.
          </li>
        </ul>
        <div>
          Qur'ani ni ujumbe wa mwisho ulioteremshwa unaoambatana na kukamilisha maandiko
          yaliyoteremshwa kabla yake. Ndivyo Mtume Muhammad ﷺ alivyofundisha ujumbe uleule wa msingi
          kama manabii wengi kabla yake, akiwemo Adam, Nuhu, Musa, Ibrahim, na Isa (amani iwashukie
          wote). Qur'ani inaweka wazi kile ambacho ubinadamu unahitaji kujua kuanzia sasa hadi Siku
          ya Hukumu, na itabakia kulindwa kutokamana na kupotea na upotoshaji uliyoathiri maandiko
          ya awali kwa njia mbalimbali.
        </div>
        <div className={pageStyles.verseContainer}>
          <PlainVerseText fontScale={1} words={verse3829.words} />
          <div className={pageStyles.verseTranslation}>
            "˹Na hiki Kitabu, tumekuteremshia wewe, kimebarikiwa, ili wazizingatie Aya zake, na
            wawaidhike wenye akili."{' '}
            <Link variant={LinkVariant.Highlight} href="/38:29" isNewTab>
              Sad 38:29
            </Link>
          </div>
          <p className={pageStyles.translationName}>— Muhsen Alberwany</p>
        </div>
        <div>
          Tunakukaribisha katika mtandao wetu wa Quran.com na tunakualika usome na usikilize Qur'ani
          kwa moyo ulio wazi, kutafakari kwa kina aya zake, kutafuta kwa ikhlasi elimu iliyo ndani
          yake, na kujifunza zaidi kwa kutumia rasilimali kwenye tovuti yetu. Tunatumai utapata
          Quran.com kuwa na manufaa na tunaomba ujumbe wa Qur'ani uibariki safari ya maisha yako.
        </div>
      </div>
      <div className={styles.section}>
        <h1>Ni mada zipi kuu ndani ya Qur'ani?</h1>
        <div>
          Kuna mada na mawazo mengi yanayochunguzwa ndani ya Qur'ani, lakini makuu ni pamoja na:
        </div>
        <ul>
          <li>Umoja wa Mwenyezi Mungu</li>
          <li>Umuhimu wa ibada na utiifu kwa Mungu</li>
          <li>Uwepo wa Akhera na Siku ya Hukumu</li>
          <li>Mwongozo na hekima ya kuishi maisha ya haki na maadili</li>
          <li>Uumbaji wa ulimwengu na viumbe vyote</li>
          <li>Nafasi ya manabii na ufunuo katika kuongoza wanadamu</li>
          <li>Matokeo ya matendo mema na mabaya</li>
          <li>Umuhimu wa haki ya kijamii na uadilifu</li>
        </ul>
        <div>
          Mada hizi zimefumwa kote ndani ya Qur'ani na hutumika kama mwongozo kwa waumini kuwaelezea
          jinsi ya kuishi kwa mujibu wa mapenzi ya Mwenyezi Mungu.
        </div>
      </div>
      <div className={styles.section}>
        <h1>Tunaijua vipi Qur'ani kuwa ni sahihi?</h1>
        <div>
          Qur'ani haitaki imani ya upofu, bali inawaalika wanadamu wote kusoma, kutafakari na
          kufuata ushahidi. Haya ni baadhi ya mambo mapana yanayowapelekea Waislamu kusadikisha
          ukweli na usahihi wa Qur'ani kuwa ni Neno la Mungu lililoteremshwa:
        </div>
        <ul>
          <li>
            Kihistoria: ushahidi wa kimaandishi na wa kiisimu unaonesha kwamba Qur'ani imerithishwa
            kwa njia mbili maarufu: maneno na maandishi tangu zama za Mtume Muhammad ﷺ,
            aliyeatangaza akiwa na umri wa miaka arobaini (takriban 610 BK) kwamba alikuwa akipokea
            ufunuo wa maneno haya kutoka kwa malaika aliyetumwa na Mungu Mmoja. Maudhui ya ujumbe
            huu pamoja na tabia ya Mtume isiyotiwa dosari, uadilifu na uaminifu wake yaliunda
            jumuiya ya waumini, kwanzia pembe za Arabia, iliyoichukua Qur'ani hadi sehemu zote za
            dunia.
          </li>
          <li>
            Mafundisho: si tu kwamba Qur'ani ilisababisha mabadiliko makubwa katika maisha ya
            Waarabu ilipoteremshwa, bali inaendelea kuleta mabadiliko chanya kwa watu binafsi na
            jamii wanaofuatilia mafundisho yake. Pamoja na mfano wa kivitendo na maelezo ya Mtume ﷺ,
            ujumbe wenyewe ni uthibitisho wenye nguvu kuwa unatoka kwa Muumba anayejua kilicho bora
            kwa maumbile.
          </li>
          <li>
            Miujiza: Qur'ani inajitangaza kuwa haiwezi kufananishwa, na wale Waarabu wa balagha
            waliopinga ujumbe wake mwanzoni, walijikuta hawawezi kukidhi changamoto ya kuleta iliyo
            mfano wake. Hii inaashiria kile kinachoitwa muujiza wa kifasihi wa Qur'ani, yaani
            kiwango cha ufasaha kinachozidi uwezo wa kibinadamu. Hata hivyo, kuna vipengele vingi
            vinavyoifanya Qur'ani kuwa ya kipekee na ya kimiujiza, na zaidi hugunduliwa kadiri
            maarifa ya binadamu yanavyopanuka.
          </li>
        </ul>
      </div>
      <div className={styles.section}>
        <h1>Je, Qur'ani inaweza kutafsiriwa katika lugha mbalimbali?</h1>
        <div>
          Idadi ya Waislamu duniani ni kubwa na tofauti, ikiakisi utajiri wa imani ya Kiislamu na
          uwepesi wake wakuingiliana na tamaduni mbalimbali. Waislamu wanatoka katika makabila,
          tamaduni, na lugha tofauti, na wamesambaa katika kila bara. Inakadiriwa kuwa wapo takriban
          Waislamu bilioni 2 duniani. Wengi wanaishi Asia, Indonesia ikiwa nchi yenye idadi kubwa
          zaidi ya Waislamu, ikifuatiwa na Pakistan, India, na Bangladesh. Hata hivyo, pia kuna
          idadi kubwa ya Waislamu Afrika, Mashariki ya Kati, Ulaya, na Amerika Kaskazini.
        </div>
        <div>
          Qur'ani imetafsiriwa kwa zaidi ya lugha 100, na kila tafsiri inaweza kuchukuliwa kuwa ni
          ufafanuzi wake wa maandishi ya awali ya Kiarabu. Ni muhimu kutambua, hata hivyo, kwamba
          Qur'ani ni Neno la Mungu na hivyo ni takatifu na halibadiliki. Kwa hiyo, tafsiri au
          tarjuma za Qur'ani zinalenga kufikisha maana ya maandishi asilia ya Kiarabu kwa usahihi
          kadiri inavyowezekana, lakini zinaweza kutofautiana katika ufafanuzi wa baadhi ya aya.
        </div>
      </div>
      <div className={styles.section}>
        <h1>Sijawahi kusoma Qur'ani awali. Ungependekeza nianzie wapi?</h1>
        <div className={styles.innerSection}>
          <i>Ikabili Qur'ani kwa moyo wazi na utayari wa kujifunza</i>: Ni muhimu kuijia Qur'ani
          ukiwa na mtazamo chanya na hamu ya kuelewa ujumbe wake. Jaribu kuweka kando dhana
          zilizotangulia au mapendeleo uliyonayo, na uiendee Qur'ani kwa moyo ulio wazi.
        </div>
      </div>
      <div className={styles.innerSection}>
        <h2>
          <u>Pendekezo la pa kuanzia:</u>
        </h2>
        <div>
          Sura ya kwanza ya Qur'ani,{' '}
          <Link isNewTab href="/al-fatihah">
            Surah Al-Fatiha
          </Link>
          , ni mahali pazuri pa kuanzia safari yako na Qur'ani.
        </div>
        <div>
          Surah Al-Fatiha ni sura ya kwanza ya Qur'ani, na ndiyo sura inayosomwa zaidi katika dini
          ya Kiislamu. Sura hii pia inajulikana kama "Ufunguzi" au "Umm al-Kitab" (Mama wa Kitabu)
          kutokana na umuhimu wake katika Qur'ani.
        </div>
        <div>
          Sura hii ina aya saba, na inasomwa mara kadhaa kwa siku wakati wa sala tano za faradhi.
          Sura hii inaanza kwa tamko "Bismillahir-Rahmanir-Rahim," linalomaanisha "Kwa jina la
          Mungu, Mwingi wa Rehema, Mwenye Kurehemu." Kauli hii hutumika kuomba baraka za Mungu kabla
          ya kuanza jambo lolote.
        </div>
        <div>
          Pia, sura hii imegawanywa katika sehemu mbili. Sehemu ya kwanza ni utangulizi ambamo
          Waislamu wanamkiri Mungu kwa Ukuu Wake, Nguvu Zake, na Rehema Zake. Sehemu ya pili ni dua
          ambamo Waislamu wanaomba mwongozo wa Mungu, msaada, na ulinzi dhidi ya kupotea.
        </div>
        <div>
          Surah Al-Fatiha ni ya muhimu kwa sababu inaweka msingi wa swala ya Kiislamu na mara nyingi
          ndiyo sehemu ya kwanza ya Qur'ani inayohifadhiwa na watoto na Waislamu wapya ulimwenguni.
        </div>
        <div className={styles.innerSection}>
          <i className={styles.italicLarge}>Je, nisome Qur'ani kuanzia mwanzo hadi mwisho?</i>
        </div>
        <div>
          Ingawa Qur'ani imekusanywa kwa mpangilio fulani, hakuna sharti kali kwa msomaji kufuata
          mpangilio huo huo anaposoma. Kwa hakika, Qur'ani yenyewe haijaweka mlolongo maalumu wa
          kusoma sura zake.
        </div>
        <div>
          Zaidi ya hayo, aya nyingi za Qur'ani zinasimama zenyewe, zikitoa mwongozo na hekima ndani
          yake bila kuhitaji msomaji awe amesoma aya zilizotangulia au zitakazofuata. Hii ni kwa
          sababu Qur'ani ni kitabu cha mwongozo, na kila aya au sura hutoa mtazamo na hekima
          inayoweza kutumika katika nyanja mbalimbali za maisha.
        </div>
        <div>
          Aidha, sura na aya za Qur'ani ziliteremshwa kwa kipindi cha miaka 23, ambapo Mtume
          Muhammad ﷺ alizisoma na kuwafikishia wafuasi wake kadiri zilivyoteremshwa. Hivyo,
          mpangilio wa kihistoria wa kuteremshwa kwa aya inaweza isiakisi mpangilio wa kimada au
          maana iliyokusudiwa.
        </div>
        <div>
          Kwa hivyo, inakubalika kabisa kwa mtu kusoma Qur'ani kwa mtindo usio mstari, kulingana na
          maslahi yake, mahitaji yake, au mazingira yake. Kwa mfano, mtu anaweza kuchagua kusoma
          sura fulani kwa ujumbe wake wa kuinua na kutia faraja, au nyingine kwa mwongozo wake wa
          kivitendo kuhusu jambo maalumu. Hatimaye, muhimu zaidi ni kuikabili Qur'ani kwa moyo ulio
          wazi, ukitafuta mwongozo na hekima katika aya zake, bila kujali mpangilio unaoutumia.
        </div>
      </div>
      <div className={styles.section}>
        <h1>Quran.com inawezaje kunisaidia katika safari yangu na Qur'ani?</h1>
        <div>
          Quran.com ni jukwaa mtandaoni lililo kamili na linalotoa vipengele mbalimbali kusaidia
          watu kuchunguza na kujihusisha na Qur'ani.
        </div>
        <div>
          Mojawapo ya vipengele muhimu zaidi vya tovuti ni mkusanyo wake wa tafsiri (tarjuma) za
          Qur'ani katika lugha mbalimbali, unaowawezesha watumiaji kusoma na kuelewa Qur'ani kwa
          lugha wanayoizoea. Tunatoa pia Tafsir (Ufafanuzi), ambazo ni maelezo na ufafanuzi wa
          kielimu wa aya za Qur'ani, na kufanya maana na muktadha wa aya ziweze kufikika zaidi kwa
          wasomaji.
        </div>
        <div>
          Kipengele kingine cha Quran.com ni sehemu ya Tafakari, ambayo inatoa nafasi kwa wasomaji
          kujihusisha na maandishi ya Qur'ani kwa kiwango cha kibinafsi zaidi. Kipengele hiki
          kinatoa tafakari ya kinadharia na ya kufikiri juu ya aya, ikiwapa wasomaji ufahamu wa kina
          wa mafundisho ya Qur'ani na umuhimu wake kwa masuala ya kisasa.
        </div>
        <div>
          Kwa wale wanaopendelea kusikiliza usomaji wa Qur'ani, Quran.com inatoa maktaba mbalimbali
          ya usomaji wa Qur'ani na{' '}
          <Link href="/reciters" isNewTab>
            wasomaji
          </Link>{' '}
          (Qurraa) mashuhuri kutoka duniani kote. Tovuti hii pia hutoa chaguzi za hali ya juu za
          kurudia kwa watumiaji wanaofanya kazi ya kukariri (kuhifadhi) Qur'ani, ikiwasaidia kurudia
          kwa urahisi na kufanya mazoezi ya aya maalum.
        </div>
        <div>
          Ili kuwasaidia zaidi watumiaji katika ufahamu wao wa maandishi ya Qur'ani, Quran.com hutoa
          tafsiri (tarjuma) za neno kwa neno pamoja na sauti zake maalum, pia hutoa kipengele cha
          vidokezo vya neno ambacho hutoa tafsiri (tarjuma) za maneno binafsi katika maandishi. Hii
          inafanya maandishi ya Qur'ani kufikiwa na kueleweka zaidi kwa wasomaji ambao bado
          wanajifunza lugha ya Kiarabu.
        </div>
        <div>
          Aidha, Quran.com inatoa{' '}
          <Link href="/radio" isNewTab>
            QuranRadio
          </Link>
          , huduma ya mtiririko inayoendesha usomaji endelevu wa Qur'ani, ikiruhusu watumiaji
          kuisikiliza Qur'ani wakati wowote.
        </div>
        <div>
          Tunatumaini utapata vipengele hivi kuwa na manufaa unapoichunguza Qur'ani. Tunajitahidi
          kukuza na kuboresha jukwaa letu, tukijumuisha maoni ya watumiaji na kutekeleza vipengele
          vipya vinavyoimarisha uzoefu wa kujifunza. Tupo katika utafiti wa kudumu na uchunguzi wa
          njia mpya za kuwasaidia wanaotafuta kujifunza na kujihusisha na Qur'ani.
        </div>
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

export default AboutTheQuranSwahili;
