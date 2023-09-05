import { SeededRandom, getRandSeed } from "./assets/modules/SeededRandom.js";
import { challengeTypes } from "./assets/modules/ChallengeType.js";

import { handleRandomSeedBtn, newBoard, handleOptionsFormSubmit, getExcludeArray, setBoardSizeValue, setDifficultyValue, setExclude, generateChallengeOptions, boardSize, defaultBoardSize, diffMultiplier, defaultDiffMultiplier, resetOptions } from "./assets/modules/options.js";
import { hideElement, showElement } from "./assets/modules/helper.js";
import { updateShareURL, copyShareURL } from "./assets/modules/share.js";
import { fetchAndGenerateBoard } from "./assets/modules/board.js";

import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
import { createRoom, joinRoom, room, clientNum, handleReadyBtn, generatePlayerMenu, onConnect, leaveRoom } from './assets/modules/race.js';

let rand;
let url;
let searchParams;

const socket = io(location.origin);

onConnect(socket);

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
    $('#seed-input').val(seed);

    setBoardSizeValue(searchParams.get('boardSize') ?? defaultBoardSize);
    setDifficultyValue(searchParams.get('difficulty') ?? defaultDiffMultiplier);
    setExclude(getExcludeArray(searchParams, true));

    updateShareURL();
    
    setColorMode(getColorMode());

    $('.bingo-board').on('click', '.board-item', handleBoardClick);
    $(".color-mode-toggle").on("click", handleColorModeToggle); 

    // options
    $('.options-form').on('submit', handleOptionsFormSubmit);
    $('.reroll-btn').on('click', () => handleRandomSeedBtn());
    $('.random-seed-btn').on('click', () => handleRandomSeedBtn(false));
    $('#board-size-range').on('input', () => setBoardSizeValue($('#board-size-range').val()));
    $('#difficulty-range').on('input', () => setDifficultyValue($('#difficulty-range').val()));
    $('.build-btn').on('click', handleOptionsFormSubmit);
    $('.reset-btn').on('click', resetOptions);

    // share
    $('.copy-link-btn').on('click', copyShareURL);

    // race
    $('.create-room-options').on('submit', (e) => createRoom(e, socket, searchParams));
    $('.join-room-options').on('submit', (e) => joinRoom(e, socket, searchParams))
    // $('.create-room-btn').on('click', () => createRoom(socket, searchParams));
    // $('.join-room-btn').on('click', () => joinRoom(socket, searchParams));
    document.getElementById('race-sidebar').addEventListener('hidden.bs.offcanvas', e => {
        $('#race-sidebar .error').addClass('hide');
    });
    $('.ready-btn').on('click', () => handleReadyBtn(socket));
    $('.exit-room-btn').on('click', leaveRoom);

    // debug
    $('.show-stats-btn').on('click', showBoardStats);
    $('.hide-stats-btn').on('click', hideBoardStats);

    generateChallengeOptions();
    fetchAndGenerateBoard(searchParams, rand);
}

$(init());


function handleBoardClick() {
    const boardItem = $(this);

    const oppositeNum = (clientNum === 1) ? 2 : 1;
    if (boardItem.hasClass(`done-${oppositeNum}`)) return;  // cancel if taken by other client

    boardItem.toggleClass(`done-${clientNum}`);

    socket.emit('board-click', room, {
        boardItem: boardItem.attr('id'),
        clientNum: clientNum,
        active: boardItem.hasClass(`done-${clientNum}`)
    });
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