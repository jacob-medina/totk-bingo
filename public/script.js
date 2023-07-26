let rand;

const uniqueEquipment = [
    'sword of the hero', "biggoron's sword", "sea-breeze shield",
    "fierce deity sword", 'scimitar of the seven', 'white sword of the sky',
    'lightscale trident', 'sea-breeze boomerang', 'daybreaker', 'hylian shield',
    'great eagle bow', 'boulder breaker', 'dusk bow', 'master sword'
];

const challTypeWeightReduce = 0.5;  // factor by which challenge type weights are reduced each time they are chosen


const weightChallengeTypes = challengeTypes.map(ct => new WeightedValue(ct, ct.weight));


function init() {
    const url = new URL(location.href);
    const params = new URLSearchParams(url.search);
    const seed = params.get("seed");

    if (seed === null) {
        replaceNewSeed();
        return;
    }

    rand = new SeededRandom(seed);
    
    setColorMode(getColorMode());
    $('.seed').val(seed);

    $('.bingo-board').on('click', '.board-item', handleBoardClick);

    // options
    $('.options-form').on('submit', handleOptionsFormSubmit);
    $('.random-seed-btn').on('click', replaceNewSeed);
    $('#board-size-range').on('input', setBoardSize);
    $('#difficulty-range').on('input', setDifficulty);

    $(".color-mode-toggle").on("click", handleColorModeToggle); 

    // debug
    $('.show-stats-btn').on('click', showBoardStats);
    $('.hide-stats-btn').on('click', hideBoardStats);

    generateChallengeOptions();
    fetchAndGenerateBoard(5);
}

$(init());


function handleBoardClick() {
    const boardItem = $(this);
    boardItem.addClass('done');
}

function handleRandomSeedBtn() {
    const randSeed = Math.random().toString().slice(2,8);
    $('#seed-input').val(randSeed);
    replaceNewSeed(randSeed);
}

// gives the site a new seed from input, or a random one instead
function replaceNewSeed(seed=undefined) {
    seed = seed ?? Math.random().toString().slice(2,8);
    const url = location.href.split('?')[0]
    location.assign(url + `?seed=${seed}`);
}


function handleOptionsFormSubmit(event) {
    event.preventDefault();

    let seed = $('#seed-input').val();

    if (seed === "") {
        handleRandomSeedBtn();
        return;
    }

    replaceNewSeed(seed);
}


function setBoardSize() {
    const boardSize = $('#board-size-range').val();
    const text = boardSize + 'x' + boardSize;
    $('.board-size').text(text);
}


function setDifficulty() {
    const difficulty = parseFloat($('#difficulty-range').val()).toFixed(1);
    $('.difficulty').text(difficulty);
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


function generateChallengeOptions() {
    const optionsContainer = $('.challenge-options');
    let html = "";

    for (const challengeType of challengeTypes.sort((a, b) => b.diffMax - a.diffMax)) {
        const dashedName = challengeType.name.split(" ").join('-');
        html +=
`<div>
    <input type="checkbox" id="${dashedName}-option" name="${dashedName}" checked>
    <label for="${dashedName}-option">${titleCase(challengeType.name)}</label>
</div>`;
        html += "\n";
}
    optionsContainer.append(html);
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
        randChallengeType.weight = Math.round(randChallengeType.weight * challTypeWeightReduce * 100) / 100;  // reduce change to get same challenge type again
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


function endLoading() {
    $('.title-container').css('animation-name', 'loading-end');
    $('.title').attr('data-loading', 'false');
    
    showElement('main');
    showElement('footer');
}


function getColorMode() {
    return localStorage.getItem('color-mode') ?? $('body').attr('data-color-mode');
}


function setColorMode(colorMode) {
    $('body').attr('data-color-mode', colorMode);
    localStorage.setItem('color-mode', colorMode);
}


function handleColorModeToggle() {
    let colorMode = getColorMode();
    $('.color-mode-toggle .material-symbols-outlined').text(colorMode + '_mode');  // set colorMode toggle icon
    colorMode = (colorMode === "dark") ? "light" : "dark";
    setColorMode(colorMode);
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