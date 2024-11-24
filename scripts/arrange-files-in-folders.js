const fs = require('fs');
const path = require('path');

// Specify the folder containing the files
const targetFolder = 'public/fonts/quran/hafs/v4/ot-svg/sepia';

// Check if target folder exists
if (!fs.existsSync(targetFolder)) {
  process.exit(1);
}

fs.readdir(targetFolder, (_, files) => {
  files.forEach((file) => {
    const filePath = path.join(targetFolder, file);

    // Check if the item is a file
    if (fs.lstatSync(filePath).isFile()) {
      const ext = path.extname(file).slice(1); // Get the file extension without the dot

      if (ext) {
        const extFolder = path.join(targetFolder, ext);

        // Create folder for the file type if it doesn't exist
        if (!fs.existsSync(extFolder)) {
          fs.mkdirSync(extFolder, { recursive: true });
        }

        const newPath = path.join(extFolder, file);

        // Move the file to the new folder
        fs.renameSync(filePath, newPath);
      }
    }
  });
});
