import { SeededRandom, getRandSeed } from "./assets/modules/SeededRandom.js";
import { MagicSquare } from "./assets/modules/MagicSquare.js";
import { challengeTypes, challTypeWeightReduce, weightedChallengeTypes } from "./assets/modules/ChallengeType.js";
import { getWeightedRandom } from "./assets/modules/WeightedValue.js";
import { uniqueEquipment } from "./assets/modules/uniqueEpuipment.js";
import { fetchData } from "./assets/modules/fetchData.js";
import { titleCase, simplifyName, getPlural, romanNumeral } from "./assets/modules/formatName.js";
import { handleRandomSeedBtn, newBoard, handleOptionsFormSubmit, setBoardSizeValue, setDifficultyValue, generateChallengeOptions, boardSize, defaultBoardSize, diffMultiplier, defaultDiffMultiplier, resetOptions } from "./assets/modules/options.js";
import { isBetween, clamp, hideElement, showElement } from "./assets/modules/helper.js";
import { updateShareURL, copyShareURL } from "./assets/modules/share.js";

let rand;
let url;
let searchParams;


function init() {
    url = new URL(location.href);
    searchParams = new URLSearchParams(url.search);
    const seed = searchParams.get("seed");

    // TODO: random seeds not occurring
    if (!searchParams.has('seed')) {
        newBoard(new URLSearchParams({seed: getRandSeed()}));
        return;
    }

    rand = new SeededRandom(seed);
    $('.seed-input').val(seed);
    updateShareURL();

    setBoardSizeValue( searchParams.get('boardSize') ?? defaultBoardSize );
    setDifficultyValue( searchParams.get('difficulty') ?? defaultDiffMultiplier );
    
    setColorMode(getColorMode());

    $('.bingo-board').on('click', '.board-item', handleBoardClick);
    $(".color-mode-toggle").on("click", handleColorModeToggle); 

    // options
    $('.options-form').on('submit', handleOptionsFormSubmit);
    $('.random-seed-btn').on('click', handleRandomSeedBtn);
    $('#board-size-range').on('input', setBoardSizeValue);
    $('#difficulty-range').on('input', setDifficultyValue);
    $('.build-btn').on('click', handleOptionsFormSubmit);
    $('.reset-btn').on('click', resetOptions);

    // share
    $('.copy-link-btn').on('click', copyShareURL);

    // debug
    $('.show-stats-btn').on('click', showBoardStats);
    $('.hide-stats-btn').on('click', hideBoardStats);

    generateChallengeOptions();
    fetchAndGenerateBoard(boardSize);
}

$(init());


function handleBoardClick() {
    const boardItem = $(this);
    if (boardItem.hasClass('done')) {
        boardItem.removeClass('done');
    }

    else boardItem.addClass('done');
}


async function fetchAndGenerateBoard(size=5) {
    const data = await fetchData();
    const entries = createChallenges(size, data);
    generateBingoBoard(size, entries);
    
    endLoading();
}


// create challenges based on magic square difficulty
function createChallenges(size, data) {
    const magicSquare = new MagicSquare(size);
    const entries = [];

    let excludeChallTypes = [];
    if (searchParams.get("exclude")) {
        excludeChallTypes = searchParams.get('exclude').split(',');  // get different challenge types
        excludeChallTypes = excludeChallTypes.map(el => el.split('-').join(" "));  // replace dashes with spaces in name
    }

    // get all entries for challenge types
    challengeTypes.forEach(type => type.getEntries(data));
    
    // choose a random entry for each difficulty
    for (const difficulty of magicSquare._matrix.flat()) {
        // adjust difficulty by diffMultiplier 
        const adjustedDiff = clamp(Math.round(difficulty * diffMultiplier), 0, 23);

        // get challenge types with current difficulty in their range
        const validChallengeTypes = weightedChallengeTypes.filter(challengeType => {
            challengeType = challengeType.value;
            if (excludeChallTypes.includes(challengeType.name)) return false;
            return isBetween(adjustedDiff, challengeType.diffMin, challengeType.diffMax);
        });

        if (validChallengeTypes.length < 1) return [];

        const randChallengeType = getWeightedRandom(validChallengeTypes, rand);
        randChallengeType.weight = Math.round(randChallengeType.weight * challTypeWeightReduce * 100) / 100;  // reduce change to get same challenge type again
        
        // TODO: get unique entries
        let randEntry = randChallengeType.getRandomEntry(rand);
        randEntry = structuredClone(randEntry);
        randEntry.challengeType = randChallengeType.name;
        randEntry.difficulty = adjustedDiff;
        randEntry.amount = randChallengeType.calcAmount(adjustedDiff);
        
        entries.push(randEntry);
    }

    return entries;
}


function generateBingoBoard(size=5, entries) {
    if (entries.length < size * size) {
        console.error('Could not get enough entries!');
        const errorMessage = $('<div class="justify-center align-center">Could not get enough challenges!</div>')
        $('.bingo-board').append(errorMessage);
        return;
    }

    $('.bingo-board').css('grid-template-columns', `repeat(${size}, ${100/size}%)`);
    $('.bingo-board').css('grid-template-rows', `repeat(${size}, ${100/size}%)`);
    
    for (let i=0; i < size*size; i++) {
        const entry = entries[i];

        const boardItem = $('<div class="board-item flex-column justify-center align-center">');
        boardItem.data('entry', entry);

        const challengeText = $('<p class="challenge-text">');
        const itemText = $('<p class="item-text">');
        const stats = $('<div class="item-stats">');
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

    const oppositeMode = (colorMode === "dark") ? "light" : "dark";
    $('.color-mode-toggle .material-symbols-outlined').text(oppositeMode + '_mode');  // set colorMode toggle icon
}


function handleColorModeToggle() {
    let colorMode = getColorMode();
    $('.color-mode-toggle .material-symbols-outlined').text(colorMode + '_mode');  // set colorMode toggle icon
    colorMode = (colorMode === "dark") ? "light" : "dark";
    setColorMode(colorMode);
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