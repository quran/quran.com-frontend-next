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

// TODO: For later
// @font-face {
//   font-family: 'Maison Neue';
//   src: url('${url}/fonts/MaisonNeue-Medium.otf');
//   /* src: url('${url}/fonts/MaisonNeue-Bold.eot'); */
//   /* src: url('${url}/fonts/MaisonNeue-Bold.ttf'); */
//   /* src: url('${url}/fonts/MaisonNeueWEB-Bold.woff'); */
//   /* src: url('${url}/fonts/MaisonNeueWEB-Bold.woff2'); */
// }

// @font-face {
//   font-family: 'Schear Grotesk';
//   /* src: url('${url}/fonts/SchearGrotesk-Black.eot'); */
//   /* src: url('${url}/fonts/SchearGrotesk-Black.ttf'); */
//   src: url('${url}/fonts/SchearGrotesk-Black.otf');
//   /* src: url('${url}/fonts/SchearGrotesk-Black.woff'); */
//   /* src: url('${url}/fonts/SchearGrotesk-Black.woff2'); */
// }

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
/* This triggers a redraw in IE to Fix IE8's :before content rendering. */
html:hover [class^='ss-'] {
  -ms-zoom: 1;
}
.ss-icon,
.ss-icon.ss-standard,
[class^='ss-']:before,
[class*=' ss-']:before,
[class^='ss-'].ss-standard:before,
[class*=' ss-'].ss-standard:before,
[class^='ss-'].right:after,
[class*=' ss-'].right:after,
[class^='ss-'].ss-standard.right:after,
[class*=' ss-'].ss-standard.right:after {
  font-family: 'SSStandard';
  font-style: normal;
  font-weight: normal;
  text-decoration: none;
  text-rendering: optimizeLegibility;
  white-space: nowrap;
  /*-webkit-font-feature-settings: "liga"; Currently broken in Chrome >= v22. Falls back to text-rendering. Safari is unaffected. */
  -moz-font-feature-settings: 'liga=1';
  -moz-font-feature-settings: 'liga';
  -ms-font-feature-settings: 'liga' 1;
  -o-font-feature-settings: 'liga';
  font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}
[class^='ss-'].right:before,
[class*=' ss-'].right:before {
  display: none;
  content: '';
}
.ss-cursor:before,
.ss-cursor.right:after {
  content: '';
}
.ss-crosshair:before,
.ss-crosshair.right:after {
  content: '⌖';
}
.ss-search:before,
.ss-search.right:after {
  content: '🔎';
}
.ss-zoomin:before,
.ss-zoomin.right:after {
  content: '';
}
.ss-zoomout:before,
.ss-zoomout.right:after {
  content: '';
}
.ss-view:before,
.ss-view.right:after {
  content: '👀';
}
.ss-attach:before,
.ss-attach.right:after {
  content: '📎';
}
.ss-link:before,
.ss-link.right:after {
  content: '🔗';
}
.ss-move:before,
.ss-move.right:after {
  content: '';
}
.ss-write:before,
.ss-write.right:after {
  content: '✎';
}
.ss-writingdisabled:before,
.ss-writingdisabled.right:after {
  content: '';
}
.ss-erase:before,
.ss-erase.right:after {
  content: '✐';
}
.ss-compose:before,
.ss-compose.right:after {
  content: '📝';
}
.ss-lock:before,
.ss-lock.right:after {
  content: '🔒';
}
.ss-unlock:before,
.ss-unlock.right:after {
  content: '🔓';
}
.ss-key:before,
.ss-key.right:after {
  content: '🔑';
}
.ss-backspace:before,
.ss-backspace.right:after {
  content: '⌫';
}
.ss-ban:before,
.ss-ban.right:after {
  content: '🚫';
}
.ss-trash:before,
.ss-trash.right:after {
  content: '';
}
.ss-target:before,
.ss-target.right:after {
  content: '◎';
}
.ss-tag:before,
.ss-tag.right:after {
  content: '';
}
.ss-bookmark:before,
.ss-bookmark.right:after {
  content: '🔖';
}
.ss-flag:before,
.ss-flag.right:after {
  content: '⚑';
}
.ss-like:before,
.ss-like.right:after {
  content: '👍';
}
.ss-dislike:before,
.ss-dislike.right:after {
  content: '👎';
}
.ss-heart:before,
.ss-heart.right:after {
  content: '♥';
}
.ss-halfheart:before,
.ss-halfheart.right:after {
  content: '';
}
.ss-star:before,
.ss-star.right:after {
  content: '⋆';
}
.ss-halfstar:before,
.ss-halfstar.right:after {
  content: '';
}
.ss-sample:before,
.ss-sample.right:after {
  content: '';
}
.ss-crop:before,
.ss-crop.right:after {
  content: '';
}
.ss-layers:before,
.ss-layers.right:after {
  content: '';
}
.ss-fill:before,
.ss-fill.right:after {
  content: '';
}
.ss-stroke:before,
.ss-stroke.right:after {
  content: '';
}
.ss-phone:before,
.ss-phone.right:after {
  content: '📞';
}
.ss-phonedisabled:before,
.ss-phonedisabled.right:after {
  content: '';
}
.ss-rss:before,
.ss-rss.right:after {
  content: '';
}
.ss-facetime:before,
.ss-facetime.right:after {
  content: '';
}
.ss-reply:before,
.ss-reply.right:after {
  content: '↩';
}
.ss-send:before,
.ss-send.right:after {
  content: '';
}
.ss-mail:before,
.ss-mail.right:after {
  content: '✉';
}
.ss-inbox:before,
.ss-inbox.right:after {
  content: '📥';
}
.ss-chat:before,
.ss-chat.right:after {
  content: '💬';
}
.ss-ellipsischat:before,
.ss-ellipsischat.right:after {
  content: '';
}
.ss-ellipsis:before,
.ss-ellipsis.right:after {
  content: '…';
}
.ss-user:before,
.ss-user.right:after {
  content: '👤';
}
.ss-femaleuser:before,
.ss-femaleuser.right:after {
  content: '👧';
}
.ss-users:before,
.ss-users.right:after {
  content: '👥';
}
.ss-cart:before,
.ss-cart.right:after {
  content: '';
}
.ss-creditcard:before,
.ss-creditcard.right:after {
  content: '💳';
}
.ss-dollarsign:before,
.ss-dollarsign.right:after {
  content: '💲';
}
.ss-barchart:before,
.ss-barchart.right:after {
  content: '📊';
}
.ss-piechart:before,
.ss-piechart.right:after {
  content: '';
}
.ss-box:before,
.ss-box.right:after {
  content: '📦';
}
.ss-home:before,
.ss-home.right:after {
  content: '⌂';
}
.ss-buildings:before,
.ss-buildings.right:after {
  content: '🏢';
}
.ss-warehouse:before,
.ss-warehouse.right:after {
  content: '';
}
.ss-globe:before,
.ss-globe.right:after {
  content: '🌎';
}
.ss-navigate:before,
.ss-navigate.right:after {
  content: '';
}
.ss-compass:before,
.ss-compass.right:after {
  content: '';
}
.ss-signpost:before,
.ss-signpost.right:after {
  content: '';
}
.ss-map:before,
.ss-map.right:after {
  content: '';
}
.ss-location:before,
.ss-location.right:after {
  content: '';
}
.ss-pin:before,
.ss-pin.right:after {
  content: '📍';
}
.ss-database:before,
.ss-database.right:after {
  content: '';
}
.ss-hdd:before,
.ss-hdd.right:after {
  content: '';
}
.ss-music:before,
.ss-music.right:after {
  content: '♫';
}
.ss-mic:before,
.ss-mic.right:after {
  content: '🎤';
}
.ss-volume:before,
.ss-volume.right:after {
  content: '🔈';
}
.ss-lowvolume:before,
.ss-lowvolume.right:after {
  content: '🔉';
}
.ss-highvolume:before,
.ss-highvolume.right:after {
  content: '🔊';
}
.ss-airplay:before,
.ss-airplay.right:after {
  content: '';
}
.ss-camera:before,
.ss-camera.right:after {
  content: '📷';
}
.ss-picture:before,
.ss-picture.right:after {
  content: '🌄';
}
.ss-video:before,
.ss-video.right:after {
  content: '📹';
}
.ss-play:before,
.ss-play.right:after {
  content: '▶';
}
.ss-pause:before,
.ss-pause.right:after {
  content: '';
}
.ss-stop:before,
.ss-stop.right:after {
  content: '■';
}
.ss-record:before,
.ss-record.right:after {
  content: '●';
}
.ss-rewind:before,
.ss-rewind.right:after {
  content: '⏪';
}
.ss-fastforward:before,
.ss-fastforward.right:after {
  content: '⏩';
}
.ss-skipback:before,
.ss-skipback.right:after {
  content: '⏮';
}
.ss-skipforward:before,
.ss-skipforward.right:after {
  content: '⏭';
}
.ss-eject:before,
.ss-eject.right:after {
  content: '⏏';
}
.ss-repeat:before,
.ss-repeat.right:after {
  content: '🔁';
}
.ss-replay:before,
.ss-replay.right:after {
  content: '↺';
}
.ss-shuffle:before,
.ss-shuffle.right:after {
  content: '🔀';
}
.ss-book:before,
.ss-book.right:after {
  content: '📕';
}
.ss-openbook:before,
.ss-openbook.right:after {
  content: '📖';
}
.ss-notebook:before,
.ss-notebook.right:after {
  content: '📓';
}
.ss-newspaper:before,
.ss-newspaper.right:after {
  content: '📰';
}
.ss-grid:before,
.ss-grid.right:after {
  content: '';
}
.ss-rows:before,
.ss-rows.right:after {
  content: '';
}
.ss-columns:before,
.ss-columns.right:after {
  content: '';
}
.ss-thumbnails:before,
.ss-thumbnails.right:after {
  content: '';
}
.ss-filter:before,
.ss-filter.right:after {
  content: '';
}
.ss-desktop:before,
.ss-desktop.right:after {
  content: '💻';
}
.ss-laptop:before,
.ss-laptop.right:after {
  content: '';
}
.ss-tablet:before,
.ss-tablet.right:after {
  content: '';
}
.ss-cell:before,
.ss-cell.right:after {
  content: '📱';
}
.ss-battery:before,
.ss-battery.right:after {
  content: '🔋';
}
.ss-highbattery:before,
.ss-highbattery.right:after {
  content: '';
}
.ss-mediumbattery:before,
.ss-mediumbattery.right:after {
  content: '';
}
.ss-lowbattery:before,
.ss-lowbattery.right:after {
  content: '';
}
.ss-emptybattery:before,
.ss-emptybattery.right:after {
  content: '';
}
.ss-lightbulb:before,
.ss-lightbulb.right:after {
  content: '💡';
}
.ss-downloadcloud:before,
.ss-downloadcloud.right:after {
  content: '';
}
.ss-download:before,
.ss-download.right:after {
  content: '';
}
.ss-uploadcloud:before,
.ss-uploadcloud.right:after {
  content: '';
}
.ss-upload:before,
.ss-upload.right:after {
  content: '';
}
.ss-fork:before,
.ss-fork.right:after {
  content: '';
}
.ss-merge:before,
.ss-merge.right:after {
  content: '';
}
.ss-transfer:before,
.ss-transfer.right:after {
  content: '⇆';
}
.ss-refresh:before,
.ss-refresh.right:after {
  content: '↻';
}
.ss-sync:before,
.ss-sync.right:after {
  content: '';
}
.ss-loading:before,
.ss-loading.right:after {
  content: '';
}
.ss-wifi:before,
.ss-wifi.right:after {
  content: '';
}
.ss-connection:before,
.ss-connection.right:after {
  content: '';
}
.ss-file:before,
.ss-file.right:after {
  content: '📄';
}
.ss-folder:before,
.ss-folder.right:after {
  content: '📁';
}
.ss-quote:before,
.ss-quote.right:after {
  content: '“';
}
.ss-text:before,
.ss-text.right:after {
  content: '';
}
.ss-font:before,
.ss-font.right:after {
  content: '';
}
.ss-print:before,
.ss-print.right:after {
  content: '⎙';
}
.ss-fax:before,
.ss-fax.right:after {
  content: '📠';
}
.ss-list:before,
.ss-list.right:after {
  content: '';
}
.ss-layout:before,
.ss-layout.right:after {
  content: '';
}
.ss-action:before,
.ss-action.right:after {
  content: '';
}
.ss-redirect:before,
.ss-redirect.right:after {
  content: '↪';
}
.ss-expand:before,
.ss-expand.right:after {
  content: '⤢';
}
.ss-contract:before,
.ss-contract.right:after {
  content: '';
}
.ss-help:before,
.ss-help.right:after {
  content: '❓';
}
.ss-info:before,
.ss-info.right:after {
  content: 'ℹ';
}
.ss-alert:before,
.ss-alert.right:after {
  content: '⚠';
}
.ss-caution:before,
.ss-caution.right:after {
  content: '⛔';
}
.ss-logout:before,
.ss-logout.right:after {
  content: '';
}
.ss-plus:before,
.ss-plus.right:after {
  content: '+';
}
.ss-hyphen:before,
.ss-hyphen.right:after {
  content: '-';
}
.ss-check:before,
.ss-check.right:after {
  content: '✓';
}
.ss-delete:before,
.ss-delete.right:after {
  content: '␡';
}
.ss-settings:before,
.ss-settings.right:after {
  content: '⚙';
}
.ss-dashboard:before,
.ss-dashboard.right:after {
  content: '';
}
.ss-notifications:before,
.ss-notifications.right:after {
  content: '🔔';
}
.ss-notificationsdisabled:before,
.ss-notificationsdisabled.right:after {
  content: '🔕';
}
.ss-clock:before,
.ss-clock.right:after {
  content: '⏲';
}
.ss-stopwatch:before,
.ss-stopwatch.right:after {
  content: '⏱';
}
.ss-calendar:before,
.ss-calendar.right:after {
  content: '📅';
}
.ss-addcalendar:before,
.ss-addcalendar.right:after {
  content: '';
}
.ss-removecalendar:before,
.ss-removecalendar.right:after {
  content: '';
}
.ss-checkcalendar:before,
.ss-checkcalendar.right:after {
  content: '';
}
.ss-deletecalendar:before,
.ss-deletecalendar.right:after {
  content: '';
}
.ss-plane:before,
.ss-plane.right:after {
  content: '✈';
}
.ss-briefcase:before,
.ss-briefcase.right:after {
  content: '💼';
}
.ss-cloud:before,
.ss-cloud.right:after {
  content: '☁';
}
.ss-droplet:before,
.ss-droplet.right:after {
  content: '💧';
}
.ss-flask:before,
.ss-flask.right:after {
  content: '';
}
.ss-up:before,
.ss-up.right:after {
  content: '⬆';
}
.ss-upright:before,
.ss-upright.right:after {
  content: '⬈';
}
.ss-right:before,
.ss-right.right:after {
  content: '➡';
}
.ss-downright:before,
.ss-downright.right:after {
  content: '⬊';
}
.ss-down:before,
.ss-down.right:after {
  content: '⬇';
}
.ss-downleft:before,
.ss-downleft.right:after {
  content: '⬋';
}
.ss-left:before,
.ss-left.right:after {
  content: '⬅';
}
.ss-upleft:before,
.ss-upleft.right:after {
  content: '⬉';
}
.ss-navigateup:before,
.ss-navigateup.right:after {
  content: '';
}
.ss-navigateright:before,
.ss-navigateright.right:after {
  content: '▻';
}
.ss-navigatedown:before,
.ss-navigatedown.right:after {
  content: '';
}
.ss-navigateleft:before,
.ss-navigateleft.right:after {
  content: '◅';
}
.ss-directup:before,
.ss-directup.right:after {
  content: '▴';
}
.ss-directright:before,
.ss-directright.right:after {
  content: '▹';
}
.ss-dropdown:before,
.ss-dropdown.right:after {
  content: '▾';
}
.ss-directleft:before,
.ss-directleft.right:after {
  content: '◃';
}
.ss-retweet:before,
.ss-retweet.right:after {
  content: '';
}
/* Legacy classes */
.ss-volumelow:before,
.ss-volumelow.right:after {
  content: '🔉';
}
.ss-volumehigh:before,
.ss-volumehigh.right:after {
  content: '🔊';
}
.ss-batteryhigh:before,
.ss-batteryhigh.right:after {
  content: '';
}
.ss-batterymedium:before,
.ss-batterymedium.right:after {
  content: '';
}
.ss-batterylow:before,
.ss-batterylow.right:after {
  content: '';
}
.ss-batteryempty:before,
.ss-batteryempty.right:after {
  content: '';
}
.ss-clouddownload:before,
.ss-clouddownload.right:after {
  content: '';
}
.ss-cloudupload:before,
.ss-cloudupload.right:after {
  content: '';
}
.ss-calendaradd:before,
.ss-calendaradd.right:after {
  content: '';
}
.ss-calendarremove:before,
.ss-calendarremove.right:after {
  content: '';
}
.ss-calendarcheck:before,
.ss-calendarcheck.right:after {
  content: '';
}
.ss-calendardelete:before,
.ss-calendardelete.right:after {
  content: '';
}
`
    .replace(/\n/g, '')
    .replace(/\s/g, '');

export default makeFonts;
