const fs = require('fs');

let data = `The Satori Mountain Crystal Usazum Shrine	Hyrule Ridge	Mysterious Voice
The White Bird's Guidance	Wao-os Shrine	Rito Village	Laissa
The Gisa Crater Crystal	Ikatak Shrine	Tabantha Frontier	Mysterious Voice
The North Hebra Mountains Crystal	Sisuran Shrine	Hebra	Mysterious Voice
The Northwest Hebra Cave Crystal	Rutafu-um Shrine	Hebra	Mysterious Voice
A Pretty Stone and Five Golden Apples	Pupunke Shrine	Great Hyrule Forest	Damia
None Shall Pass	Sakunbomar Shrine	Great Hyrule Forest	Zooki
Maca's Special Place	Ninjis Shrine	Great Hyrule Forest	Maca
The Death Caldera Crystal	Momosik Shrine	Death Mountain	Mysterious Voice
The Lake Intenoch Cave Crystal	Moshapin Shrine	Eldin Canyon	Mysterious Voice
Rock for Sale	Jochi-ihiga Shrine	Akkala - Tarrey Town	Hagie
Dyeing to Find It	Kurakat Shrine	Lanayru Great Spring	Steward Construct
The High Spring and the Light Rings	Zakusu Shrine	Mount Lanayru	Nazbi
The Lanayru Road Crystal	O-ogim Shrine	East Necluda - Lanayru Promenade	Mysterious Voice
The Ralis Channel Crystal	Joniu Shrine	Lanayru Great Spring	Mysterious Voice
Keys Born of Water	Jochisiu Shrine	West Necluda	Steward Construct
The Oakle's Navel Cave Crystal	Tokiy Shrine	East Necluda	Mysterious Voice
Ride the Giant Horse	Ishokin Shrine	Faron	Baddek
The Lake Hylia Crystal	En-oma Shrine	Lake Hylia	Mysterious Voice
Legend of the Soaring Spear	Utojis Shrine	East Necluda	Tattered Notebook
The Gerudo Canyon Crystal	Rakakudaj Shrine	Gerudo Canyon	Mysterious Voice
The North Hyrule Sky Crystal	Mayam Shrine	North Hyrule Sky Archipelago	Mysterious Voice
The South Hyrule Sky Crystal	Jinodok Shrine	South Hyrule Sky Archipelago	Mysterious Voice
The Tabantha Sky Crystal	Ganos Shrine	Tabantha Sky Archipelago	Mysterious Voice
The East Hebra Sky Crystal	Tauninoud Shrine	East Hebra Sky Archipelago	Mysterious Voice
The Sky Mine Crystal	Gikaku Shrine	Akkala Sky	Mysterious Voice
The Sokkala Sky Crystal	Natak Shrine	Sokkala Sky Archipelago	Mysterious Voice
The South Lanayru Sky Crystal   Mayanas Shrine	South Lanayru Sky Archipelago	Mysterious Voice
The North Necluda Sky Crystal	Josiu Shrine	North Necluda Sky Archipelago	Mysterious Voice
The West Necluda Sky Crystal	Ukoojisi Shrine	West Necluda Sky Archipelago	Mysterious Voice
The Necluda Sky Crystal	Kumamayn Shrine	Necluda Sky Archipelago	Mysterious Voice`;

data = data.split('\n');
data = data.map(element => {
    return element.split("\t")[0];
})
data = data.map(element => {return {id: -3, category: "shrine quests", name: element}});
console.log(data);

fs.writeFile(`./${process.argv[2]}.json`, JSON.stringify(data, null, '\t'), error => console.error(error));