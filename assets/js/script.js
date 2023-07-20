class SeededRandom {
    constructor(seed=Math.random().toString().slice(2,8)) {
        this._seed = seed;
        this.getSeed = () => this._seed;
        this.setSeed = (newSeed) => {this._seed = newSeed;};
        this.rand = mulberry32(cyrb128(this.getSeed()));
        this.randInt = (max) => Math.floor(this.rand() * max);
    }
}

class Matrix {
    constructor(sizeX, sizeY=undefined) {
        this.sizeX = sizeX;
        this.sizeY = sizeY ?? sizeX;
        this._matrix = Array(this.sizeX).fill("?").map(() => Array(this.sizeY).fill("?"));
    }

    display() {
        let output = ""
        for (const row of this._matrix) {
            for (const col of row) {
                output += col + ' ';
            }
            output += '\n';
        }
        console.log(output);
    }

    insert(element, x, y) {
        this._matrix[x][y] = element;
    }

    getElement(x, y) {
        return this._matrix[x][y];
    }

    setMatrix(matrix) {
        this._matrix = matrix;
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

    matrix = new Matrix(4);
    matrix.insert(3, 0, 1);
    matrix.insert(5, 1, 2);
    matrix.display();

    rand = new SeededRandom(params.get("seed"));
    console.log("Rand Seed:", rand.getSeed());
    
    $('.random-seed-btn').on('click', replaceNewSeed);
    $(".color-mode-toggle").on("click", handleColorModeToggle); 
    fetchAndGenerateBoard(5);
}

$(init());


// gives the site a new random seed
function replaceNewSeed() {
    const seed = Math.random().toString().slice(2,8);
    const url = location.href.split('?')[0]
    location.replace(url + `?seed=${seed}`);
}


async function fetchAndGenerateBoard(size=5) {
    const data = await fetchData();
    const entries = getRandomEntries(size * size, data);
    console.log(entries);
    generateBingoBoard(size, entries);

    endLoading();
}


function fetchData() {
    runningLocal = location.href.startsWith('file://');

    const compendiumPromise = fetch('https://botw-compendium.herokuapp.com/api/v3/compendium/all?game=totk')
        .then(response => {
            if (response.ok) return response.json();
            else console.error(response);
        })
        .then(data => {
            data = data.data;
            data.sort((a, b) => a.id - b.id);  // sort by id, ASC
            return data;
        });

    if (!runningLocal) {

        const sideQuestsPromise = fetch('./assets/data/side-quests.json')
        .then(response => response.json());
        
        const sideAdventuresPromise = fetch('./assets/data/side-adventures.json')
        .then(response => response.json());
        
        const shrineQuestsPromise = fetch('./assets/data/shrine-quests.json')
        .then(response => response.json());

        const armorPromise = fetch('./assets/data/armor.json')
        .then(response => response.json());
        
        const miscItemsPromise = fetch('./assets/data/misc-items.json')
        .then(response => response.json());
        
        return Promise.all([compendiumPromise, sideQuestsPromise, sideAdventuresPromise, shrineQuestsPromise, armorPromise, miscItemsPromise])
        .then(data => data.flat());
    }

    else {
        return compendiumPromise;
    }
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
function getChallenge({category, id, name, edible}) {
    // normal side adventues
    if (category === "side adventures") return {challenge: `side adventure:`, entry: name};

    // normal side quests
    if (category === "side quests") return {challenge: `side quest:`, entry: name};

    // normal shrine quests
    if (category === "shrine quests") return {challenge: `shrine quest:`, entry: name};

    // unique bosses
    if (id === 200) return {challenge: "defeat", entry: titleCase("demon king ganondorf")};
    if ((id >= 191 && id <= 201) || id === 165) return {challenge: "defeat", entry: titleCase(name)};

    // unique misc items
    if (name === 'autobuild') return {challenge: "obtain", entry: titleCase(name)};  // autobuild

    // unique creatures
    if (name === 'patricia') return {challenge: "feed", entry: titleCase(name)};
    if (name === 'dondon') return {challenge: "feed a", entry: titleCase(name)};
    if (id >= 2 && id <= 5) return {challenge: "ride the", entry: titleCase(name)};  // unique horses
    if (id === 159) return {challenge: "defeat a", entry: titleCase(name)};  // training construct
    if ((id >= 188 && id <= 190) || id === 202) return {challenge: "ride", entry: titleCase(name)};  // dragons

    const uniqueEquipment = [
        'sword of the hero', "biggoron's sword", "sea-breeze shield",
        "fierce deity sword", 'scimitar of the seven', 'white sword of the sky',
        'lightscale trident', 'sea-breeze boomerang', 'daybreaker', 'hylian shield',
        'great eagle bow', 'boulder breaker', 'dusk bow', 'master sword'
    ];

    if (uniqueEquipment.includes(name)) return {challenge: "obtain the", entry: titleCase(name)};
    
    // armor
    if (category === "armor") return {challenge: "obtain the", entry: titleCase(name)};
    
    let amount = rand.randInt(5) + 1;
    name = getPlural(amount, simplifyName(name, id));
    name = titleCase(romanNumeral(name));

    const vowels = ['a','e','i','o','u'];
    if (amount === 1) amount = "a" + (vowels.includes(name.charAt(0).toLowerCase()) ? "n" : "");

    if (id === 504) return {challenge: `open ${amount}`, entry: titleCase(name)};  // treasure chest
    if (id === 509 || id === -11) return {challenge: `discover ${amount}`, entry: titleCase(name)};  // wells, caves
    if (id >= 505 && id <= 508) return {challenge: `mine ${amount}`, entry: titleCase(name)};  // ore deposits
    if (id === 72) return {challenge: `collect ${amount}`, entry: titleCase(name)};  // fairies
    if ([1, 6, 8].includes(id)) return {challenge: `ride ${amount}`, entry: titleCase(name)};  // horses, sand seals
    if (id === 7) return {challenge: `find ${amount}`, entry: titleCase(name)};  // donkeys
    if ([14,18,19,29].includes(id)) return {challenge: `feed ${amount}`, entry: titleCase(name)};  // white goats, hateno cows, hylian retriever
    if (id === 52) return {challenge: `hit ${amount}`, entry: titleCase(name)};  // white goats
    if ([-6, -8, -15].includes(id)) return {challenge: `collect ${amount}`, entry: titleCase(name)};  // sage's will, yiga schematic, korok seeds
    if ([-10, -12, -14].includes(id)) return {challenge: `activate ${amount}`, entry: titleCase(name)};  // towers, cherry blossoms, nightroot
    if (id === -7) return {challenge: `install ${amount}`, entry: titleCase(name)};  // Hudson signs

    // normal materials & equipment
    if (category === "materials" || category === "equipment") return {challenge: `collect ${amount}`, entry: name};

    // normal creatures
    if (category === "creatures" && edible === true) return {challenge: `collect ${amount}`, entry: name};
    if (category === "creatures") return {challenge: `hunt ${amount}`, entry: name};
    
    // normal monsters
    if (category === "monsters") return {challenge: `kill ${amount}`, entry: name};

    return {challenge: "", entry: name}
}


function simplifyName(name, id) {
    const namesToSimplify = [
        'duck', 'pigeon', 'sparrow', 'seagull', 'bear', 'fox', 'buck',
        'coyote', 'cow', 'heron', 'squirrel', 'boar', 'hawk', 'doe', 'crow'
    ];

    if (id === 171 || id === 170) return "stone talus";
    if (id === 13) return "goat";
    
    const words = name.split(" ");
    
    if (words.includes('wolf') || words.includes('coyote')) return 'wolf';
    
    if (words.some(word => namesToSimplify.includes(word))) {
        return words.at(-1);
    }

    return name;
}

function getPlural(amount, name) {
    const words = name.split(" ");
    const pluralWordBefore = (word) => words.slice(0, words.indexOf(word) - 1).join(" ") + " " + words[words.indexOf(word) - 1] + "s " + words.slice(words.indexOf(word)).join(" ");

    if (amount === 1) return name;

    if (words.includes('moose') || words.at(-1) === "keese" || words.includes('carp') || words.includes('honey')) return name;
    if (name === "donkey") return name + "s";
    if (name === "wolf") return 'wolves';
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