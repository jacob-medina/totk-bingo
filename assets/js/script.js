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
    fetchAndGenerateBoard(4);
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

        const boardItem = $('<div class="board-item justify-center align-center">');
        // boardItem.css('background-image', `url("${entry.image.slice(0,-10)}"), url("https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png")`)

        const itemText = $('<p>');
        itemText.text(entry.name);

        boardItem.append(itemText);
        $('.bingo-board').append(boardItem);
    }
}


function handleColorModeToggle() {
    let colorMode = $('body').attr('data-color-mode');
    colorMode = (colorMode === "dark") ? "light" : "dark";
    $('body').attr('data-color-mode', colorMode);
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