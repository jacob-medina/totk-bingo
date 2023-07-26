const path = require('path');
const fs = require('fs');

let entries = [];
const dataDir = path.join(__dirname, '../data');

fs.readdir(dataDir, (error, files) => {
    if (error) return console.error('Error when scanning directory: ' + error);

    files.forEach(file => {
        if (path.extname(file) === '.json') {
            const fileDir = path.join(__dirname, '../data', file);
            const item = require(fileDir);
            entries.push(item);
        }
    });

    entries = entries.flat();
});

module.exports = entries;