const fs = require('fs');

let data = `Camera Work in the Depths
Impa and the Geoglyphs
Tulin of Rito Village
Riju of Gerudo Town
Yunobo of Goron City
Sidon of the Zora
Guidance from Ages Past
The Sludge-Covered Statue
The Broken Slate
Clues to the Sky
Restoring the Zora Armor
Trail of the Master Sword`;

data = data.split('\n');
data = data.map(quest => {
    return {id: -7, category: "main quest", name: quest}
});
console.log(data);

fs.writeFile(`./${process.argv[2]}.json`, JSON.stringify(data, null, '\t'), error => console.error(error));