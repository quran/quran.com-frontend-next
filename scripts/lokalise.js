/**
 * A script that syncs the local codebase with Lokalize. The script support two commands:
 *
 * 1. Pulling all translation files from Lokalize by using the syntax `yarn run lokalise:pull`.
 * 2. Pushing a specific file for a specific locale to Lokalise by using the syntax `yarn run lokalise:push {filename} {locale}` e.g. `yarn run lokalise:push common.json en`.
 */

/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const fs = require('fs');

const { LokaliseApi } = require('@lokalise/node-api');
const admZip = require('adm-zip');
const dotenv = require('dotenv');
const request = require('superagent');

const LOCALES_PATH = './locales';
const DESTINATION_FILE = `${LOCALES_PATH}/locales.zip`;

const configs = dotenv.config({ path: '.env.local' });
const API_KEY = configs.parsed.LOKALISE_API_KEY;
const PROJECT_ID = configs.parsed.LOKALISE_PROJECT_ID;

if (!API_KEY || !PROJECT_ID) {
  console.log('Lokalise API keys are not configured!');
} else {
  const lokaliseApi = new LokaliseApi({ apiKey: API_KEY });

  // if it's a push operation.
  if (process.argv[2] === 'push') {
    const filename = process.argv[3];
    const locale = process.argv[4];
    // if the filename was not passed
    if (!filename) {
      console.log('Please enter the name of the file!');
    } else if (!locale) {
      // if the locale was not passed
      console.log('Please enter the name of the locale!');
    } else {
      const i18nConfig = JSON.parse(fs.readFileSync('i18n.json', 'utf-8'));
      const { locales } = i18nConfig;
      const filePath = `${LOCALES_PATH}/${locale}/${filename}`;
      // 1. Check if the locale is invalid/not-supported
      if (!locales.includes(locale)) {
        console.log('Please enter a valid locale!');
      } else if (!fs.existsSync(filePath)) {
        // 2. Check if the locale file exits
        console.log(`File ${filename} does not exist!`);
      } else {
        // 3. Open the file then convert it to base64
        const toBeUploadedFileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const base64Data = Buffer.from(JSON.stringify(toBeUploadedFileContent)).toString('base64');
        // 4. Start the uploading process.
        lokaliseApi
          .files()
          .upload(PROJECT_ID, { data: base64Data, filename, lang_iso: locale })
          .then(() => {
            console.log('File upload has been added to Lokalise queue successfully!');
          })
          .catch(() => {
            console.log('Something went wrong while trying to upload the file');
          });
      }
    }
  } else {
    console.log('Requesting zipped file url...');
    // 1. Request the url that contained the zipped file of all the translations files.
    lokaliseApi
      .files()
      .download(PROJECT_ID, { format: 'json', original_filenames: true })
      .then((response) => {
        console.log('Starting to download the zipped file...');
        // 2. Download the zipped file.
        request
          .get(response.bundle_url)
          .on('error', () => {
            console.log('An error occurred while trying to download the zipped file.');
          })
          .pipe(fs.createWriteStream(DESTINATION_FILE))
          .on('finish', () => {
            console.log('Downloaded the file successfully, starting to unzip the files...');
            // eslint-disable-next-line new-cap
            const zip = new admZip(DESTINATION_FILE);
            // 3. un-zip the file into the locales folder
            zip.extractAllTo(LOCALES_PATH, true);
            console.log('Unzipped the file successfully, deleting the zipped file.');
            // 4. delete the zipped file.
            fs.unlink(DESTINATION_FILE, (err) => {
              if (err) {
                console.log('An error occurred while trying to delete the zipped file.');
              }
              console.log('The zipped file was deleted successfully.');
            });
          });
      })
      .catch(() => {
        console.log('An error occurred while trying to request the zipped file url.');
      });
  }
}
