const fs = require('fs');

let data = `Hateno Village Research Lab - Lookout Landing

Filling Out the Compendium - Hateno Ancient Tech Lab

Presenting: The Travel Medallion! - Hateno Ancient Tech Lab

Presenting: Hero's Path Mode! - Hateno Ancient Tech Lab

Presenting: Sensor +! - Hateno Ancient Tech Lab

Mattison's Independence - Tarrey Town

A Letter to Koyin - Hateno Village

A New Signature Food - Hateno Village

Reede's Secret - Hateno Village

Cece's Secret - Hateno Village

Team Cece or Team Reede? - Hateno Village

The Mayoral Election - Hateno Village

Ruffian-Infested Village - Lurelin Village

Lurelin Village Restoration Project - Lurelin Village

Potential Princess Sightings! - Lucky Clover Gazette

The Beckoning Woman - Outskirt Stable

Gourmets Gone Missing - Riverside Stable

The Beast and the Princess - New Serenne Stable

Zelda's Golden Horse - Snowfield Stable

White Goats Gone Missing - Tabantha Bridge Stable

For Our Princess! - Foothill Stable

The All-Clucking Cucco - South Akkala Stable

The Missing Farm Tools - Wetland Stable

Princess Zelda Kidnapped?! - Dueling Peaks Stable

An Eerie Voice - Highland Stable

The Blocked Well - Gerudo Canyon Stable

The Flute Player's Plan - Highland Stable

Honey, Bee Mine - West Necluda

The Hornist's Dramatic Escape - Tabantha Frontier

Serenade to a Great Fairy - Woodland Stable

Serenade to Kaysa - Outskirt Stable

Serenade to Cotera - Dueling Peaks Stable

Serenade to Mija - Snowfield Stable

Bring Peace to Hyrule Field! - Central Hyrule

Bring Peace to Necluda! - Central Hyrule

Bring Peace to Eldin! - Eldin Canyon

Bring Peace to Akkala! - Eldin Canyon

Bring Peace to Faron! - Faron Grasslands

Bring Peace to Hebra! - Faron Grasslands

Hestu's Concerns - Not specified on the Adventure Log

The Hunt for Bubbul Gems! - Eldin Canyon

The Search for Koltin - Eldin Canyon

A Monstrous Collection I - Tarrey Town

A Monstrous Collection II - Tarrey Town

A Monstrous Collection III - Tarrey Town

A Monstrous Collection IV - Tarrey Town

A Monstrous Collection V - Tarrey Town

Investigate the Thyphlo Ruins - Thyphlo Ruins

The Owl Protected by Dragons - Thyphlo Ruins

The Corridor between Two Dragons - Thyphlo Ruins

The Six Dragons - Thyphlo Ruins

The Long Dragon - Thyphlo Ruins

Legend of the Great Sky Island - Great Sky Island

Messages from an Ancient Era - Lookout Landing

A Deal With the Statue - Royal Hidden Passage

Who Goes There? - Lookout Landing

A Call from the Depths - Temple of Time Ruins

Infiltrating the Yiga Clan - Yiga Clan Hideout

The Yiga Clan Exam - Yiga Blademaster Station

Master Kohga of the Yiga Clan - Great Abandoned Central Mine`;

data = data.split('\n\n');
data = data.map(element => {
    if (element === 'The All-Clucking Cucco - South Akkala Stable') return 'The All-Clucking Cucco';
    return element.split("-")[0].slice(0, -1);
})
data = data.map(element => {return {id: -2, category: "side adventures", name: element}});
console.log(data);

fs.writeFile(`./${process.argv[2]}.json`, JSON.stringify(data, null, '\t'), error => console.error(error));