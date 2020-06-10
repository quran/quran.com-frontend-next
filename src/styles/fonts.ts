import range from 'lodash/range';

export const baseUrl = 'https://quranstatic.nyc3.cdn.digitaloceanspaces.com';

export const makeFont = (url: string, pageNumber: string | number) => `
@font-face {
  font-family: p${pageNumber};
  src: url('${url}/fonts/quran-fonts/v1/woff2/p${pageNumber}.woff2'),
  url('${url}/fonts/quran-fonts/v1/tff/p${pageNumber}.ttf') format('truetype'),
  url('${url}/fonts/quran-fonts/v1/woff/p${pageNumber}.woff') format("woff");
}
`;

const makePageNumberFonts = (url = '') =>
  range(604)
    .map((number) => {
      const pageNumber = number + 1;

      return makeFont(url, pageNumber);
    })
    .join('');

const makeFonts = (url = baseUrl) =>
  `
${makePageNumberFonts(url)}
@font-face {
  font-family: quran-common;
  src: url('${url}/fonts/quran-common/quran_common.ttf')
    format('truetype');
}
.p0,
.text-p0 {
  font-family: quran-common;
  &.end {
    padding: 0;
    text-align: left;
  }
}
@font-face {
  font-family: 'SFProText-Regular';
  src: local("SFProText Regular"), local("SFProText-Regular"),
    local("SF Pro Text Regular"), url("${url}/fonts/SFProText-Regular.woff2"),
    url("${url}/fonts/SFProText-Regular.eot?#iefix") format("embedded-opentype"),
    url("${url}/fonts/SFProText-Regular.woff") format("woff"),
    url("${url}/fonts/SFProText-Regular.ttf") format("truetype"),
    url("${url}/fonts/SFProText-Regular.svg#SFProText-Regular") format("svg");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SFProText-Medium';
  src: local("SFProText Medium"), local("SFProText-Medium"),
    local("SF Pro Text Medium"), url("${url}/fonts/SFProText-Medium.woff2"),
    url("${url}/fonts/SFProText-Medium.eot?#iefix") format("embedded-opentype"),
    url("${url}/fonts/SFProText-Medium.woff") format("woff"),
    url("${url}/fonts/SFProText-Medium.ttf") format("truetype"),
    url("${url}/fonts/SFProText-Medium.svg#SFProText-Medium") format("svg");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SFProText-Bold';
  src: local("SFProText Bold"), local("SFProText-Bold"),
    local("SF Pro Text Bold"), url("${url}/fonts/SFProText-Bold.woff2"),
    url("${url}/fonts/SFProText-Bold.eot?#iefix") format("embedded-opentype"),
    url("${url}/fonts/SFProText-Bold.woff") format("woff"),
    url("${url}/fonts/SFProText-Bold.ttf") format("truetype"),
    url("${url}/fonts/SFProText-Bold.svg#SFProText-Bold") format("svg");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "bismillah";
  src: url("${url}/fonts/bismillah/bismillah.woff2"),
    url("${url}/fonts/bismillah/bismillah.eot?#iefix")
      format("embedded-opentype"),
    url("${url}/fonts/bismillah/bismillah.woff") format("woff"),
    url("${url}/fonts/bismillah/bismillah.ttf") format("truetype"),
    url("${url}/fonts/bismillah/bismillah.svg#bismillah") format("svg");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

.word_font {
  line-height: 150%;
}
@font-face {
  font-family: 'SSStandard';
  src: url('${url}/fonts/ss-standard/ss-standard.eot');
  src: url('${url}/fonts/ss-standard/ss-standard.eot?#iefix')
      format('embedded-opentype'),
    url('${url}/fonts/ss-standard/ss-standard.woff')
      format('woff'),
    url('${url}/fonts/ss-standard/ss-standard.ttf')
      format('truetype'),
    url('${url}/fonts/ss-standard/ss-standard.svg#SSStandard')
      format('svg');
  font-weight: normal;
  font-style: normal;
}
@font-face {
  font-family: 'Nafees';
  src: url('${url}/fonts/nafees/nafees-nastaleeq-webfont.eot?#iefix')
      format('embedded-opentype'),
    url('${url}/fonts/nafees/nafees-nastaleeq-webfont.woff')
      format('woff'),
    url('${url}/fonts/nafees/nafees-nastaleeq-webfont.ttf')
      format('truetype'),
    url('${url}/fonts/nafees/nafees-nastaleeq-webfont.svg#NafeesRegular')
      format('svg');
  font-weight: normal;
  font-style: normal;
}
@font-face {
  font-family: 'divehi';
  src: url('${url}/fonts/divehi/divehi.eot?#iefix')
      format('embedded-opentype'),
    url('${url}/fonts/divehi/divehi.woff2') format('woff2'),
    url('${url}/fonts/divehi/divehi.woff') format('woff'),
    url('${url}/fonts/divehi/divehi.ttf') format('truetype'),
    url('${url}/fonts/divehi/divehi.svg#dhivehiregular')
      format('svg');
}
@font-face {
  font-family: 'surahnames';
  src: url('${url}/fonts/surah-names/surah-names.eot');
  src: url('${url}/fonts/surah-names/surah-names.eot#iefix')
      format('embedded-opentype'),
    url('${url}/fonts/surah-names/surah-names.ttf')
      format('truetype'),
    url('${url}/fonts/surah-names/surah-names.woff')
      format('woff'),
    url('${url}/fonts/surah-names/surah-names.svg#surah-names')
      format('svg');
  font-weight: normal;
  font-style: normal;
}
@font-face {
  font-family: 'bismillah';
  src: url('${url}/fonts/bismillah/bismillah.eot');
  src: url('${url}/fonts/bismillah/bismillah.eot#iefix')
      format('embedded-opentype'),
    url('${url}/fonts/bismillah/bismillah.ttf')
      format('truetype'),
    url('${url}/fonts/bismillah/bismillah.woff')
      format('woff'),
    url('${url}/fonts/bismillah/bismillah.svg#bismillah')
      format('svg');
  font-weight: normal;
  font-style: normal;
}
#bismillah {
  font-family: 'bismillah';
  font-size: 60px;
  color: #000;
  padding: 25px 0;
}

`
    .replace(/\n/g, '')
    .replace(/\s/g, '');

export default makeFonts;
