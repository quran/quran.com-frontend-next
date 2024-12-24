const fs = require('fs');
const path = require('path');

// Define the base directory and file numbers to delete
const baseDir = path.join('public', 'fonts', 'quran', 'hafs', 'v4');
const directories = ['ot-svg', 'colrv1']; // Folders to check
const themes = ['dark', 'light', 'sepia']; // The theme directories for ot-svg
const fileTypes = ['ttf', 'woff', 'woff2']; // The file formats
const fileNumbers = [1]; // <== Modify this, The file numbers to delete

// Helper function to delete a file
const deleteFile = (filePath) => {
  console.log(`Attempting to delete file: ${filePath}`);

  fs.unlink(filePath, (err) => {
    if (err && err.code === 'ENOENT') {
      console.log(`File not found: ${filePath}`);
    } else if (err) {
      console.error(`Error deleting file ${filePath}:`, err);
    } else {
      console.log(`Successfully deleted file: ${filePath}`);
    }
  });
};

// Start the deletion process
console.log(`Starting to delete files in ${baseDir}...`);

// Iterate through directories
directories.forEach((dir) => {
  if (dir === 'ot-svg') {
    // For ot-svg, loop through themes and file types
    themes.forEach((theme) => {
      fileTypes.forEach((fileType) => {
        fileNumbers.forEach((num) => {
          const filePath = path.join(baseDir, dir, theme, fileType, `p${num}.${fileType}`);
          deleteFile(filePath);
        });
      });
    });
  } else if (dir === 'colrv1') {
    // For colrv1, no themes, so just loop through file types
    fileTypes.forEach((fileType) => {
      fileNumbers.forEach((num) => {
        const filePath = path.join(baseDir, dir, fileType, `p${num}.${fileType}`);
        deleteFile(filePath);
      });
    });
  }
});

console.log('Deletion process completed.');
