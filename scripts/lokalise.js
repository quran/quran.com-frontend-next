/* eslint-disable react-func/max-lines-per-function */
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
const inquirer = require('inquirer');
const inquirerFileTreeSelection = require('inquirer-file-tree-selection-prompt');
const request = require('superagent');

const LOCALES_PATH = './locales';
const DESTINATION_FILE = `${LOCALES_PATH}/locales.zip`;
const configs = dotenv.config({ path: '.env.local' });
const API_KEY = configs.parsed.LOKALISE_API_KEY;
const PROJECT_ID = configs.parsed.LOKALISE_PROJECT_ID;
const SYNC_REMOTE_TO_LOCAL = 'Sync remote files to local';
const PUSH_LOCAL_TO_REMOTE = 'Push local file to remote';

if (!API_KEY || !PROJECT_ID) {
  console.log('Lokalise API keys are not configured!');
} else {
  const lokaliseApi = new LokaliseApi({ apiKey: API_KEY });

  inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection);
  inquirer
    .prompt([
      {
        type: 'list',
        message: 'Please select the operation',
        name: 'operationType',
        choices: [SYNC_REMOTE_TO_LOCAL, PUSH_LOCAL_TO_REMOTE],
      },
    ])
    .then(({ operationType }) => {
      if (operationType === SYNC_REMOTE_TO_LOCAL) {
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
      } else if (operationType === PUSH_LOCAL_TO_REMOTE) {
        inquirer
          .prompt({
            type: 'file-tree-selection',
            name: 'file',
            message: 'choose a translation file',
            root: `${LOCALES_PATH}/en`,
          })
          .then((answers) => {
            const { file: filePath } = answers;
            const filenameSplits = filePath.split('/');
            const filename = filenameSplits[filenameSplits.length - 1];
            // 1. Open the file then convert it to base64
            const toBeUploadedFileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const base64Data = Buffer.from(JSON.stringify(toBeUploadedFileContent)).toString(
              'base64',
            );
            console.log(`Starting to push ${filename} to Lokalise`);
            // 2. Start the uploading process.
            lokaliseApi
              .files()
              .upload(PROJECT_ID, { data: base64Data, filename, lang_iso: 'en' })
              .then(() => {
                console.log(`${filename} has been pushed to Lokalise queue successfully!`);
              })
              .catch(() => {
                console.log('Something went wrong while trying to upload the file');
              });
          });
      }
    });
}
