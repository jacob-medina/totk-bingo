class SeededRandom {
    constructor(seed=Math.random().toString().slice(2,8)) {
        this._seed = seed;
        this.getSeed = () => this._seed;
        this.setSeed = (newSeed) => {this._seed = newSeed;};
        this.rand = mulberry32(cyrb128(this.getSeed()));
        this.randInt = (max) => Math.floor(this.rand() * max);
    }
}

let rand;

function init() {
    const url = new URL(location.href);
    const params = new URLSearchParams(url.search);

    if (params.get("seed") === null) {
        replaceNewSeed();
        return;
    }

    rand = new SeededRandom(params.get("seed"));
    console.log("Rand Seed:", rand.getSeed());
    
    $(".color-mode-toggle").on("click", handleColorModeToggle); 
    fetchAndGenerateBoard(5);
}

$(init());


// gives the site a new random seed
function replaceNewSeed() {
    const seed = Math.random().toString().slice(2,8);
    location.replace(location.href + `?seed=${seed}`);
}


async function fetchAndGenerateBoard(size=5) {
    const data = await fetchData();
    const entries = getRandomEntries(size * size, data);
    console.log(entries);
    generateBingoBoard(size, entries);

    endLoading();
}


function fetchData() {
    return fetch('https://botw-compendium.herokuapp.com/api/v3/compendium/all?game=totk')
    .then(response => {
        if (response.ok) return response.json();
        else console.error(response);
    })
    .then(data => {
        data = data.data;
        data.sort((a, b) => a.id - b.id);  // sort by id, ASC
        return data;
    });
}


// returns num amount of unique, random entries from data
function getRandomEntries(num, data) {
    const entries = new Set();
    while (entries.size < num) {
        const randEntry = data[rand.randInt(data.length)];
        entries.add(randEntry);
    }
    return [...entries];
}


function generateBingoBoard(size=5, entries) {
    $('.bingo-board').css('grid-template-columns', `repeat(${size}, ${100/size}%)`);
    $('.bingo-board').css('grid-template-rows', `repeat(${size}, ${100/size}%)`);
    
    for (let i=0; i < size*size; i++) {
        const entry = entries[i];

        const boardItem = $('<div class="board-item flex-column justify-center align-center">');

        const challengeText = $('<p class="challenge-text">');
        const itemText = $('<p class="item-text">');
        
        const challenge = getChallenge(entry);
        challengeText.text(challenge.challenge);
        itemText.text(challenge.entry);

        boardItem.append(challengeText, itemText);
        $('.bingo-board').append(boardItem);
    }
}


// returns challenge text appropriate to the type of entry
function getChallenge({category, id, name}) {
    // unique bosses
    if ((id >= 191 && id <= 201) || id === 165) return {challenge: "defeat", entry: titleCase(name)};

    // unique creatures
    if (name === 'patricia') return {challenge: "feed", entry: titleCase(name)};
    if (name === 'dondon') return {challenge: "feed a", entry: titleCase(name)};
    if (id >= 2 && id <= 5) return {challenge: "ride a", entry: titleCase(name)};
    if (id === 159) return {challenge: "defeat a", entry: titleCase(name)};  // training construct
    if ((id >= 188 && id <= 190) || id === 202) return {challenge: "ride", entry: titleCase(name)};  // dragons

    const uniqueEquipment = [
        'sword of the hero', "biggoron's sword", "sea-breeze shield",
        "fierce deity sword", 'scimitar of the seven', 'white sword of the sky',
        'lightscale trident', 'sea-breeze boomerang', 'daybreaker', 'hylian shield',
        'great eagle bow', 'boulder breaker'
    ];
    if (id === 329) return {challenge: "obtain the", entry: titleCase(name)};  // master sword
    if (uniqueEquipment.includes(name)) return {challenge: "collect a", entry: titleCase(name)};
    
    let amount = 5; //rand.randInt(5) + 1;
    name = getPlural(amount, simplifyName(name, id));
    name = titleCase(romanNumeral(name)); 
    if (amount === 1) amount = "a";

    if (id === 504) return {challenge: `open ${amount}`, entry: titleCase(name)};  // treasure chest
    if (id === 509) return {challenge: `discover ${amount}`, entry: titleCase(name)};  // wells
    if (id >= 505 && id <= 508) return {challenge: `mine ${amount}`, entry: titleCase(name)};  // ore deposits
    if (id === 72) return {challenge: `collect ${amount}`, entry: titleCase(name)};  // fairies
    if (id === 1 || id === 6) return {challenge: `ride ${amount}`, entry: titleCase(name)};  // horses
    if (id === 7) return {challenge: `find ${amount}`, entry: titleCase(name)};  // donkeys
    if (id === 14 || id === 18 || id === 19) return {challenge: `feed ${amount}`, entry: titleCase(name)};  // white goats, hateno cows
    if (id === 52) return {challenge: `hit ${amount}`, entry: titleCase(name)};  // white goats
    
    // normal materials & equipment
    if (category === "materials" || category === "equipment") return {challenge: `collect ${amount}`, entry: name};

    // normal creatures
    if (category === "creatures") return {challenge: `hunt ${amount}`, entry: name};
    
    // normal monsters
    if (category === "monsters") return {challenge: `kill ${amount}`, entry: name};

    return {challenge: "", entry: name}
}


function simplifyName(name, id) {
    const namesToSimplify = [
        'duck', 'pigeon', 'sparrow', 'seagull', 'bear', 
        'fox', 'coyote', 'cow', 'heron', 'squirrel', 'boar'
    ];

    if (id === 171) return "stone talus";

    const words = name.split(" ");

    if (words.some(word => namesToSimplify.includes(word))) {
        return words.at(-1);
    }

    return name;
}

function getPlural(amount, name) {
    const words = name.split(" ");
    const pluralWordBefore = (word) => words.slice(0, words.indexOf(word) - 1).join(" ") + " " + words[words.indexOf(word) - 1] + "s " + words.slice(words.indexOf(word)).join(" ");

    if (amount === 1) return name;

    if (words.includes('moose') || words.at(-1) === "keese" || words.includes('carp')) return name;
    if (name === "donkey") return name + "s";
    if (words.includes('of')) return pluralWordBefore('of');
    if (words.includes('(new)')) return pluralWordBefore('(new)');
    if (words.includes('bass') || name.endsWith('ss') || name.endsWith('x')) return name + "es";
    if (name.endsWith('s')) return name;
    if (name.endsWith('y')) return name.slice(0, -1) + 'ies';
    if (name.endsWith('h')) return name + "es";
    if (name.endsWith('i') || name.endsWith(' iv')) return name + "'s";

    if (amount > 1) return name + "s";
    return name;
}


function endLoading() {
    $('.title-container').css('animation-name', 'loading-end');
    $('.title').attr('data-loading', 'false');
    showElement('main');
}


function handleColorModeToggle() {
    let colorMode = $('body').attr('data-color-mode');
    colorMode = (colorMode === "dark") ? "light" : "dark";
    $('body').attr('data-color-mode', colorMode);
}


function romanNumeral(string) {
    const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v'];
    const romanNumberalPlurals = romanNumerals.map(string => string += "'s");

    let words = string.toLowerCase().split(" ");
    words = words.map(word => {
        if (romanNumerals.includes(word)) return word.toUpperCase();
        if (romanNumberalPlurals.includes(word)) return word.toUpperCase().slice(0, -2) + "'s";
        return word;
    });

    return words.join(" ");
}

function titleCase(string) {
    let words = string.split(" ");
    words = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return words.join(" ");
}


function hideElement(element) {
    $(element).addClass("hide");
}

function showElement(element) {
    $(element).removeClass("hide");
}


// START OF code from bryc @ https://stackoverflow.com/a/47593316
// hashing function
function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return (h1^h2^h3^h4)>>>0;
}

// random number generator
function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}
// END OF code from bryc @ https://stackoverflow.com/a/47593316