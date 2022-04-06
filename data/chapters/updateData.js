const fs = require('fs');

const dataSource = require('./__datasource.js');

const files = fs.readdirSync('./');
files.map((fileName) => {
  if (fileName.startsWith('__') || fileName.startsWith('updateData')) return null;
  return fs.readFile(fileName, (err, data) => {
    if (err) throw err;
    const parsedData = JSON.parse(data.toString());
    const newData = appendData(parsedData);
    fs.writeFile(fileName, JSON.stringify(newData), (errr) => {
      if (err) console.log(errr);
    });
  });
});

const appendData = (data) => {
  const newObj = {};
  Object.entries(data).map(([num, objVal]) => {
    newObj[num] = {
      ...objVal,
      nameArabic: dataSource.find((a) => a.number === Number(num)).name,
    };
    return null;
  });
  return newObj;
};
