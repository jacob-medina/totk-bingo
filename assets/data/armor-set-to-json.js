const fs = require('fs');

let data = `Awakening,Mask of Awakening,TRUE
Awakening,Trousers of Awakening,TRUE
Awakening,Tunic of Awakening,TRUE
Barbarian,Barbarian Armor,TRUE
Barbarian,Barbarian Helm,TRUE
Barbarian,Barbarian Leg Wraps,TRUE
Charged,Charged Headdress,TRUE
Charged,Charged Shirt,TRUE
Charged,Charged Trousers,TRUE
Climbing,Climber's Bandana,TRUE
Climbing,Climbing Boots,TRUE
Climbing,Climbing Gear,TRUE
Dark,Dark Hood,FALSE
Dark,Dark Trousers,FALSE
Dark,Dark Tunic,FALSE
Depths,Gaiters of the Depths,TRUE
Depths,Hood of the Depths,TRUE
Depths,Tunic of the Depths,TRUE
Desert Voe,Desert Voe Headband,TRUE
Desert Voe,Desert Voe Spaulder,TRUE
Desert Voe,Desert Voe Trousers,TRUE
Divine,Vah Medoh Divine Helm,TRUE
Divine,Vah Naboris Divine Helm,TRUE
Divine,Vah Rudania Divine Helm,TRUE
Divine,Vah Ruta Divine Helm,TRUE
Ember,Ember Headdress,TRUE
Ember,Ember Shirt,TRUE
Ember,Ember Trousers,TRUE
Evil Spirit,Evil Spirit Armor,FALSE
Evil Spirit,Evil Spirit Greaves,FALSE
Evil Spirit,Evil Spirit Mask,FALSE
Fierce Deity,Fierce Deity Armor,TRUE
Fierce Deity,Fierce Deity Boots,TRUE
Fierce Deity,Fierce Deity Mask,TRUE
Flamebreaker,Flamebreaker Armor,TRUE
Flamebreaker,Flamebreaker Boots,TRUE
Flamebreaker,Flamebreaker Helm,TRUE
Froggy,Froggy Hood,TRUE
Froggy,Froggy Leggings,TRUE
Froggy,Froggy Sleeve,TRUE
Frostbite,Frostbite Headdress,TRUE
Frostbite,Frostbite Shirt,TRUE
Frostbite,Frostbite Trousers,TRUE
Glide,Glide Mask,TRUE
Glide,Glide Shirt,TRUE
Glide,Glide Tights,TRUE
Hero,Cap of the Hero,TRUE
Hero,Trousers of the Hero,TRUE
Hero,Tunic of the Hero,TRUE
Hylian,Hylian Hood,TRUE
Hylian,Hylian Trousers,TRUE
Hylian,Hylian Tunic,TRUE
Jewelry,Amber Earrings,TRUE
Jewelry,Diamond Circlet,TRUE
Jewelry,Opal Earrings,TRUE
Jewelry,Ruby Circlet,TRUE
Jewelry,Sapphire Circlet,TRUE
Jewelry,Topaz Earrings,TRUE
Miner,Miner's Mask,TRUE
Miner,Miner's Top,TRUE
Miner,Miner's Trousers,TRUE
Monster Mask,Bokoblin Mask,FALSE
Monster Mask,Horriblin Mask,FALSE
Monster Mask,Lizalfos Mask,FALSE
Monster Mask,Lynel Mask,FALSE
Monster Mask,Moblin Mask,FALSE
Mystic,Mystic Headpiece,FALSE
Mystic,Mystic Robe,FALSE
Mystic,Mystic Trousers,FALSE
Phantom,Phantom Armor,FALSE
Phantom,Phantom Greaves,FALSE
Phantom,Phantom Helm,FALSE
Radiant,Radiant Mask,TRUE
Radiant,Radiant Shirt,TRUE
Radiant,Radiant Tights,TRUE
Royal Guard,Royal Guard Boots,TRUE
Royal Guard,Royal Guard Cap,TRUE
Royal Guard,Royal Guard Uniform,TRUE
Rubber,Rubber Armor,TRUE
Rubber,Rubber Helm,TRUE
Rubber,Rubber Tights,TRUE
Sky,Cap of the Sky,TRUE
Sky,Trousers of the Sky,TRUE
Sky,Tunic of the Sky,TRUE
Snowquill,Snowquill Headdress,TRUE
Snowquill,Snowquill Trousers,TRUE
Snowquill,Snowquill Tunic,TRUE
Soldier,Soldier's Armor,TRUE
Soldier,Soldier's Greaves,TRUE
Soldier,Soldier's Helm,TRUE
Stealth,Stealth Chest Guard,TRUE
Stealth,Stealth Mask,TRUE
Stealth,Stealth Tights,TRUE
Time,Cap of Time,TRUE
Time,Trousers of Time,TRUE
Time,Tunic of Time,TRUE
Tingle,Tingle's Hood,FALSE
Tingle,Tingle's Shirt,FALSE
Tingle,Tingle's Tights,FALSE
Twilight,Cap of Twilight,TRUE
Twilight,Trousers of Twilight,TRUE
Twilight,Tunic of Twilight,TRUE
Wild,Cap of the Wild,TRUE
Wild,Trousers of the Wild,TRUE
Wild,Tunic of the Wild,TRUE
Wind,Cap of the Wind,TRUE
Wind,Trousers of the Wind,TRUE
Wind,Tunic of the Wind,TRUE
Yiga,Yiga Armor,TRUE
Yiga,Yiga Mask,TRUE
Yiga,Yiga Tights,TRUE
Zonaite,Zonaite Helm,TRUE
Zonaite,Zonaite Shin Guards,TRUE
Zonaite,Zonaite Waistguard,TRUE
Zora,Zora Armor,TRUE
Zora,Zora Greaves,TRUE
Zora,Zora Helm,TRUE
null,Ancient Hero's Aspect,TRUE
null,Archaic Legwear,FALSE
null,Archaic Tunic,FALSE
null,Archaic Warm Greaves,FALSE
null,Cece Hat,FALSE
null,Champion's Leathers,TRUE
null,Island Lobster Shirt,FALSE
null,Korok Mask,FALSE
null,Lightning Helm,FALSE
null,Majora's Mask,FALSE
null,Midna's Helmet,FALSE
null,Ravio's Hood,FALSE
null,Sand Boots,TRUE
null,Shiek's Mask,TRUE
null,Snow Boots,TRUE
null,Tunic of Memories,TRUE
null,Well-Worn Hair Band,FALSE
null,Zant's Helmet,FALSE`;

data = data.split('\n');
data = data.filter(armor => {
    let set, name, upgradable;
    [set, name, upgradable] = armor.split(',');
    return set !== "null";
}).map(armor => armor.split(',')[0]);
data = [...new Set(data)];
data = data.map(set => {
    return {id: -6, category: "armor set", name: set}
});
console.log(data);

fs.writeFile(`./${process.argv[2]}.json`, JSON.stringify(data, null, '\t'), error => console.error(error));