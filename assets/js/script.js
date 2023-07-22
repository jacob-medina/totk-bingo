class SeededRandom {
    constructor(seed=Math.random().toString().slice(2,8)) {
        this._seed = seed;
        this.getSeed = () => this._seed;
        this.setSeed = (newSeed) => {this._seed = newSeed;};
        this.rand = mulberry32(cyrb128(this.getSeed()));
        this.randInt = (max) => Math.floor(this.rand() * max);
    }
}


class MagicSquare {
    constructor(size) {
        this.size = Math.min(Math.max(size, 3), 5);
        this._matrix = Array(this.size).fill("?").map(() => Array(this.size).fill("?"));

        switch(this.size) {
            case 3:
                this.setMatrix([
                    [8,1,6],
                    [3,5,7],
                    [4,9,2]]);
                break;
            
            case 4:
                this.setMatrix([
                    [1,15,14,4],
                    [10,11,8,5],
                    [7,6,9,12],
                    [16,2,3,13]]);
                break;
            
            case 5:
                this.setMatrix([
                    [17,24,1,8,15],
                    [23,5,7,14,16],
                    [4,6,13,20,22],
                    [10,12,19,21,3],
                    [11,18,25,2,9]]);
                break;
        }

        this.map(x => x - 1);
    }

    display() {
        let output = "";
        for (const row of this._matrix) {
            for (const col of row) {
                output += col + ' ' + ((col >= 10) ? '' : " ");
            }
            output += '\n';
        }
        console.log(output);
    }

    getElement(x, y) {
        return this._matrix[x][y];
    }

    setMatrix(matrix) {
        this._matrix = matrix;
    }

    map(func) {
        const newMatrix = [];
        for (const row of this._matrix) {
            const newRow = [];
            for (let col of row) {
                newRow.push(func(col));
            }
            newMatrix.push(newRow);
        }

        this.setMatrix(newMatrix);
    }

    reflectX() {
        for (const row of this._matrix) {
            row.reverse();
        }
    }

    reflectY() {
        const swap = (rowA, rowB, matrix) => {
            if (rowA < 0) rowA = matrix.length + rowA;
            if (rowB < 0) rowB = matrix.length + rowB;

            const rowATemp = matrix[rowA];
            matrix[rowA] = matrix[rowB];
            matrix[rowB] = rowATemp;
            return matrix;
        }

        for (let i = 0; i < Math.floor(this._matrix.length / 2); i++) {
            this.setMatrix(swap(i, -(i + 1), this._matrix));
        }
    }
}


class ChallengeType {
    constructor(category, difficultyMin, difficultyMax, weight=1, uniqueName=undefined, filterFunc=undefined, calcAmount=undefined) {
        this.category = [category].flat();
        this.diffMin = difficultyMin;
        this.diffMax = difficultyMax;
        this.weight = weight;
        
        if (uniqueName) this.name = uniqueName;
        else this.name = this.category[0];

        if (filterFunc) this.filterFunc = filterFunc;
        if (calcAmount) this.calcAmount = calcAmount;
        else this.calcAmount = () => 1;

        this.entries = null;
    }

    getEntries(data) {
        if (this.entries) return this.entries;
        if (!data) return null;

        // filter by category
        let filteredData = [];
        for (const cat of this.category) {
            filteredData.push(data.filter(entry => entry.category === cat));
        }
        filteredData = filteredData.flat();

        // filter data by filterFunc (if applicable)
        this.entries = filteredData;
        if (this.filterFunc) this.entries = filteredData.filter(this.filterFunc);

        return this.entries;
    }

    getRandomEntry(seededRandom) {
        return this.getEntries()[seededRandom.randInt(this.getEntries().length)];
    }
}


class WeightedValue {
    constructor(value, weight=1) {
        this.value = value;
        this.weight = weight;
    }
}


// returns a random value from an array of WeightedValues
// larger weights have a higher chance of being chosen
function getWeightedRandom(weightValues, seededRandom) {
    let weightSum = 0;
    const weightedArray = weightValues.map(wv => {
        weightSum += wv.weight;

        return {
            value: wv.value,
            max: weightSum
        };
    });

    const randNum = seededRandom.rand() * weightSum;
    const value = weightedArray.find(wv => randNum < wv.max);
    return value.value;
}

let rand;

const uniqueEquipment = [
    'sword of the hero', "biggoron's sword", "sea-breeze shield",
    "fierce deity sword", 'scimitar of the seven', 'white sword of the sky',
    'lightscale trident', 'sea-breeze boomerang', 'daybreaker', 'hylian shield',
    'great eagle bow', 'boulder breaker', 'dusk bow', 'master sword'
];

const challengeTypes = [
    // challenges with 1 item
    new ChallengeType('main quests', 23, 24, 3),
    new ChallengeType('side quests', 5, 8, 1),
    new ChallengeType('shrine quests', 8, 12, 1),
    new ChallengeType('side adventures', 12, 20, 1),
    new ChallengeType('armor sets', 18, 24, 1),
    new ChallengeType('autobuild', 19, 19, 1),
    new ChallengeType('creatures', 13, 13, 1, 'patricia', entry => entry.name === 'patricia'),
    new ChallengeType('monsters', 23, 23, 1, 'bosses', entry => {
        const {id} = entry;
        const isBossOrGanondorf = isBetween(id, 191, 201);
        const isKohga = (id === 165);
        return isBossOrGanondorf || isKohga;
    }),
    new ChallengeType(['monsters', 'creatures'], 9, 9, 1, 'special horse/dragon/dondon', entry => {
        const {id, name} = entry;
        const isSpecialHorse = isBetween(id, 2, 5);
        const isDragon = (isBetween(id, 188, 190) || id === 202);
        const isDondon = (name === 'dondon');
        return isSpecialHorse || isDragon || isDondon;
    }),
    new ChallengeType('monsters', 3, 3, 0.2, 'training construct', entry => entry.id === 159),
    new ChallengeType('armor', 12, 14, 1),
    new ChallengeType('armor', 16, 16, 1, 'armor ★', entry => entry.upgradable),
    new ChallengeType('equipment', 14, 16, 1, 'unique equipment', entry => uniqueEquipment.includes(entry.name)),
    
    // challenges with 1 or more items
    new ChallengeType('korok seeds', 0, 24, 1.5, undefined, undefined,
        difficulty => clamp(2 * difficulty, 1, 1000)),
    new ChallengeType('shrines', 0, 24, 2, undefined, undefined,
        difficulty => clamp(Math.ceil(1.3 * difficulty), 1, 152)),
    new ChallengeType('towers', 0, 24, 1, undefined, undefined,
        difficulty => clamp(Math.ceil(difficulty / 2.5), 1, 15)),
    new ChallengeType('lightroots', 0, 24, 1, undefined, undefined,
        difficulty => clamp(Math.ceil(difficulty / 1.3), 1, 120)),
    new ChallengeType('cherry blossom trees', 0, 20, 0.3, undefined, undefined,
        difficulty => clamp(Math.ceil(difficulty / 1.3), 1, 8)),
    new ChallengeType('caves', 0, 24, 1, undefined, undefined,
        difficulty => clamp(Math.ceil(1.3 * difficulty), 1, 147)),
    new ChallengeType('yiga schematics', 0, 24, 0.2, undefined, undefined,
        difficulty => clamp(Math.ceil(difficulty / 2), 1, 34)),
    new ChallengeType('hudson signs', 0, 24, 1, undefined, undefined,
        difficulty => clamp(Math.ceil(1.3 * difficulty), 1, 81)),
    new ChallengeType("sage's wills", 0, 24, 0.5, undefined, undefined,
        difficulty => clamp(Math.ceil(difficulty / 3), 1, 20)),
    new ChallengeType('creatures', 0, 10, 1, undefined,
        entry => {
            const {id, name} = entry;
            const isSpecialHorse = (id >= 2 && id <= 5);
            const isDondon = (name === 'dondon');
            const isPatricia = (name === 'patricia');
            return !isSpecialHorse && !isDondon && !isPatricia;
        }, 
        difficulty => Math.max(Math.ceil(1.3 * difficulty), 1)),
    new ChallengeType('monsters', 4, 16, 1, 'mini bosses',
        entry => {
            const {id, name} = entry;
            const words = name.split(" ");
            const isMiniBoss = isBetween(id, 147, 150) || isBetween(id, 160, 162) || (isBetween(id, 169, 187) && id !== 184) || words.includes('lynel');
            const isSilver = words.includes('silver') || words.includes('iv');
            return isMiniBoss || isSilver;
        },
        difficulty => clamp(Math.ceil(difficulty / 5), 1, 3)),
    new ChallengeType('monsters', 0, 16, 1, undefined,
        entry => {
            const {id, name} = entry;
            const words = name.split(" ");
            const isBoss = isBetween(id, 191, 201) || (id === 165);
            const isDragon = (isBetween(id, 188, 190) || id === 202);
            const isMiniBoss = isBetween(id, 147, 150) || isBetween(id, 160, 162) || (isBetween(id, 169, 187) && id !== 184) || words.includes('lynel');
            const isSilver = words.includes('silver') || words.includes('iv');
            return !isBoss && !isDragon && !isMiniBoss && !isSilver;
        },
        difficulty => Math.max(difficulty, 1)),
    new ChallengeType('equipment', 2, 16, 1, undefined,
        entry => !uniqueEquipment.includes(entry), 
        difficulty => Math.max(Math.floor(difficulty / 1.3), 1)),
    new ChallengeType('equipment', 10, 18, 1, 'equipment ✧',
        entry => entry.name.endsWith('(new)'),
        difficulty => Math.max(Math.ceil(difficulty / 4), 1)),
    new ChallengeType('materials', 0, 10, 1, undefined, undefined,
        difficulty => Math.max(Math.ceil(1.3 * difficulty), 1))
];

const weightChallengeTypes = challengeTypes.map(ct => new WeightedValue(ct, ct.weight));


function init() {
    const url = new URL(location.href);
    const params = new URLSearchParams(url.search);

    if (params.get("seed") === null) {
        replaceNewSeed();
        return;
    }

    rand = new SeededRandom(params.get("seed"));
    // console.log("Rand Seed:", rand.getSeed());
    
    $('.random-seed-btn').on('click', replaceNewSeed);
    $('.show-stats-btn').on('click', showBoardStats);
    $('.hide-stats-btn').on('click', hideBoardStats);
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


// hides the stats for each board item
function hideBoardStats() {
    $('.item-stats').remove();
    hideElement('.hide-stats-btn');
    showElement('.show-stats-btn');
}


// shows the stats for each board item
function showBoardStats() {
    $('.item-stats').remove();  // clear any previous stats

    $('.board-item').each(function() {
        const boardItem = $(this);
        const entry = boardItem.data('entry');

        const stats = $('<div class="item-stats">')
                
        stats.append(`<p> diff: ${entry.difficulty} </p>`);
        stats.append(`<p> amount: ${entry.amount} </p>`);

        boardItem.append(stats);
    });

    for (const challengeType of challengeTypes) {
        console.log(challengeType.name, challengeType.getEntries());
    }

    hideElement('.show-stats-btn');
    showElement('.hide-stats-btn');
}


async function fetchAndGenerateBoard(size=5) {
    const data = await fetchData();
    magicSquare = new MagicSquare(size);
    const entries = [];

    // get all entries for challenge types
    challengeTypes.forEach(type => type.getEntries(data));
    
    // choose a random entry for each difficulty
    for (const difficulty of magicSquare._matrix.flat()) {
        // get challenge types with current difficulty in their range
        const validChallengeTypes = weightChallengeTypes.filter(challengeType => {
            challengeType = challengeType.value;
            return isBetween(difficulty, challengeType.diffMin, challengeType.diffMax);
        });
        const randChallengeType = getWeightedRandom(validChallengeTypes, rand);
        randChallengeType.weight = Math.round(randChallengeType.weight * 0.8 * 100) / 100;  // reduce change to get same challenge type again
        console.log(`${randChallengeType.name} weight:`, randChallengeType.weight);
        
        // TODO: get unique entries
        let randEntry = randChallengeType.getRandomEntry(rand);
        randEntry = structuredClone(randEntry);
        randEntry.challengeType = randChallengeType.name;
        randEntry.difficulty = difficulty;
        randEntry.amount = randChallengeType.calcAmount(difficulty);
        
        entries.push(randEntry);
    }

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
        const mainQuestsPromise = fetch('./assets/data/main-quests.json')
        .then(response => response.json());

        const sideQuestsPromise = fetch('./assets/data/side-quests.json')
        .then(response => response.json());
        
        const sideAdventuresPromise = fetch('./assets/data/side-adventures.json')
        .then(response => response.json());
        
        const shrineQuestsPromise = fetch('./assets/data/shrine-quests.json')
        .then(response => response.json());

        const armorPromise = fetch('./assets/data/armor.json')
        .then(response => response.json());

        const armorSetsPromise = fetch('./assets/data/armor-sets.json')
        .then(response => response.json()); 
        
        const miscItemsPromise = fetch('./assets/data/misc-items.json')
        .then(response => response.json());
        
        return Promise.all([compendiumPromise, mainQuestsPromise, sideQuestsPromise, sideAdventuresPromise, shrineQuestsPromise, armorPromise, armorSetsPromise, miscItemsPromise])
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
        boardItem.data('entry', entry);

        const challengeText = $('<p class="challenge-text">');
        const itemText = $('<p class="item-text">');
        const stats = $('<div class="item-stats">')
        const difficultyText = $('<p class="item-text">');
        
        const challenge = getChallenge(entry);
        challengeText.text(challenge.challenge);
        itemText.text(challenge.entry);
        difficultyText.text(entry.difficulty);

        stats.append(difficultyText);
        boardItem.append(challengeText, itemText);
        $('.bingo-board').append(boardItem);
    }
}


// returns challenge text appropriate to the type of entry
function getChallenge({category, id, name, edible, amount, challengeType}) {
    // normal main quests
    if (category === "main quests") return {challenge: `main quest:`, entry: `'${name}'`};

    // normal side adventues
    if (category === "side adventures") return {challenge: `side adventure:`, entry: `'${name}'`};

    // normal side quests
    if (category === "side quests") return {challenge: `side quest:`, entry: `'${name}'`};

    // normal shrine quests
    if (category === "shrine quests") return {challenge: `shrine quest:`, entry: `'${name}'`};

    // normal armor sets
    if (category === "armor sets") return {challenge: `obtain the`, entry: `${name} Set`};

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
    if (challengeType === 'armor ★') return {challenge: "obtain the", entry: `${titleCase(name)}★`};
    if (category === "armor") return {challenge: "obtain the", entry: titleCase(name)};
    
    // let amount = //rand.randInt(5) + 1;
    name = getPlural(amount, simplifyName(name, id));
    name = titleCase(romanNumeral(name));

    const vowels = ['a','e','i','o','u'];
    if (amount === 1) amount = "a" + (vowels.includes(name.charAt(0).toLowerCase()) ? "n" : "");

    if (id === 504) return {challenge: `open ${amount}`, entry: titleCase(name)};  // treasure chest
    if (id === 509 || id === -13) return {challenge: `discover ${amount}`, entry: titleCase(name)};  // wells, caves
    if (id >= 505 && id <= 508) return {challenge: `mine ${amount}`, entry: titleCase(name)};  // ore deposits
    if (id === 72) return {challenge: `collect ${amount}`, entry: titleCase(name)};  // fairies
    if ([1, 6, 8].includes(id)) return {challenge: `ride ${amount}`, entry: titleCase(name)};  // horses, sand seals
    if (id === 7) return {challenge: `find ${amount}`, entry: titleCase(name)};  // donkeys
    if ([14, 18, 19, 29].includes(id)) return {challenge: `feed ${amount}`, entry: titleCase(name)};  // white goats, hateno cows, hylian retriever
    if (id === 52) return {challenge: `anger ${amount}`, entry: titleCase(name)};  // coocoos
    if ([-8, -10, -17].includes(id)) return {challenge: `collect ${amount}`, entry: titleCase(name)};  // sage's will, yiga schematic, korok seeds
    if ([-12, -14, -15].includes(id)) return {challenge: `activate ${amount}`, entry: titleCase(name)};  // towers, cherry blossoms, lightroot
    if (id === -9) return {challenge: `install ${amount}`, entry: titleCase(name)};  // Hudson signs
    if (category === "shrines") return {challenge: `complete ${amount}`, entry: titleCase(name)};  // shrines

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
        'duck', 'pigeon', 'sparrow', 'seagull', 'bear', 'fox', 'buck', 'moose', 'sheep',
        'coyote', 'cow', 'heron', 'squirrel', 'boar', 'hawk', 'doe', 'crow', 'buffalo'
    ];

    if (id === 171 || id === 170) return "stone talus";
    if (id === 13) return "goat";
    
    const words = name.split(" ");
    
    if (words.includes('wolf') || words.includes('coyote')) return 'wolf';
    if (words.includes('(new)')) return words.slice(0,-1).join(" ") + "✧";
    
    if (words.some(word => namesToSimplify.includes(word))) {
        return words.at(-1);
    }

    return name;
}

function getPlural(amount, name) {
    const words = name.split(" ");
    const pluralWordBefore = (word) => words.slice(0, words.indexOf(word) - 1).join(" ") + " " + words[words.indexOf(word) - 1] + "s " + words.slice(words.indexOf(word)).join(" ");

    if (amount === 1) return name;

    if (words.includes('moose') || words.includes('sheep') || words.at(-1) === "keese" || words.includes('carp') || words.includes('honey')) return name;
    if (name === "donkey") return name + "s";
    if (name === "wolf") return 'wolves';
    if (words.includes('of')) return pluralWordBefore('of');
    if (name.endsWith('✧')) return name.slice(0, -1) + "s✧";
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


function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function isBetween(value, min, max) {
    return (value >= min && value <= max);
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