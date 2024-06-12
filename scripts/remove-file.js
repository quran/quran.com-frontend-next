/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// This script will delete all files by name on a specified folder
function deleteFilesByName(dir, filename) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}: ${err.message}`);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting stats of file ${filePath}: ${err.message}`);
          return;
        }

        if (stats.isDirectory()) {
          deleteFilesByName(filePath, filename); // Recursively call for subdirectory
        } else if (stats.isFile() && file === filename) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error deleting file ${filePath}: ${err.message}`);
            } else {
              console.log(`Deleted: ${filePath}`);
            }
          });
        }
      });
    });
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the target directory: ', (targetDirectory) => {
  rl.question('Enter the filename to delete: ', (fileNameToDelete) => {
    deleteFilesByName(targetDirectory, fileNameToDelete);
    rl.close();
  });
});
