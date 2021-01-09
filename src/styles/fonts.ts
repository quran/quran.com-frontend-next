import range from 'lodash/range';

export const makeUthmaniFont = (pageNumber: string | number) => `
@font-face {
  font-family: p${pageNumber};
  src: url('fonts/QCF-uthmani/QCF_P${`00${pageNumber}`.slice(-3)}.ttf') format('truetype');
}
`;

const makePageNumberFonts = () =>
  range(604)
    .map((number) => {
      const pageNumber = number + 1;

      return makeUthmaniFont(pageNumber);
    })
    .join('');

const makeFonts = () =>
  `
${makePageNumberFonts()}
@font-face {
  font-family: quran-common;
  src: url('fonts/quran-common/quran_common.ttf')
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
  font-family: IndoPak,
  src: url('fonts/indoPak/_PDMS_Saleem_QuranFont.ttf') format('truetype');
}

@font-face {
  font-family: 'SFProText-Regular';
  src: local("SFProText Regular"), local("SFProText-Regular"),
    local("SF Pro Text Regular"), url("fonts/SFPro/SFProText-Regular.woff2"),
    url("fonts/SFPro/SFProText-Regular.eot?#iefix") format("embedded-opentype"),
    url("fonts/SFPro/SFProText-Regular.woff") format("woff"),
    url("fonts/SFPro/SFProText-Regular.ttf") format("truetype"),
    url("fonts/SFPro/SFProText-Regular.svg#SFProText-Regular") format("svg");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SFProText-Medium';
  src: local("SFProText Medium"), local("SFProText-Medium"),
    local("SF Pro Text Medium"), url("fonts/SFPro/SFProText-Medium.woff2"),
    url("fonts/SFPro/SFProText-Medium.eot?#iefix") format("embedded-opentype"),
    url("fonts/SFPro/SFProText-Medium.woff") format("woff"),
    url("fonts/SFPro/SFProText-Medium.ttf") format("truetype"),
    url("fonts/SFPro/SFProText-Medium.svg#SFProText-Medium") format("svg");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SFProText-Bold';
  src: local("SFProText Bold"), local("SFProText-Bold"),
    local("SF Pro Text Bold"), url("fonts/SFPro//SFProText-Bold.woff2"),
    url("fonts/SFPro/SFProText-Bold.eot?#iefix") format("embedded-opentype"),
    url("fonts/SFPro/SFProText-Bold.woff") format("woff"),
    url("fonts/SFPro/SFProText-Bold.ttf") format("truetype"),
    url("fonts/SFPro/SFProText-Bold.svg#SFProText-Bold") format("svg");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "bismillah";
  src: url("fonts/bismillah/bismillah.woff2"),
    url("fonts/bismillah/bismillah.eot?#iefix")
      format("embedded-opentype"),
    url("fonts/bismillah/bismillah.woff") format("woff"),
    url("fonts/bismillah/bismillah.ttf") format("truetype"),
    url("fonts/bismillah/bismillah.svg#bismillah") format("svg");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'surahnames';
  src: url('fonts/surah-names/surah-names.eot');
  src: url('fonts/surah-names/surah-names.eot#iefix')
      format('embedded-opentype'),
    url('fonts/surah-names/surah-names.ttf')
      format('truetype'),
    url('fonts/surah-names/surah-names.woff')
      format('woff'),
    url('fonts/surah-names/surah-names.svg#surah-names')
      format('svg');
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: 'bismillah';
  src: url('fonts/bismillah/bismillah.eot');
  src: url('fonts/bismillah/bismillah.eot#iefix')
      format('embedded-opentype'),
    url('fonts/bismillah/bismillah.ttf')
      format('truetype'),
    url('fonts/bismillah/bismillah.woff')
      format('woff'),
    url('fonts/bismillah/bismillah.svg#bismillah')
      format('svg');
  font-weight: normal;
  font-style: normal;
}
`
    .replace(/\n/g, '')
    .replace(/\s/g, '');

export default makeFonts;
