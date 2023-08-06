import { fetchAndGenerateBoard } from "./board.js";
import { SeededRandom } from "./SeededRandom.js";
import { updateShareURL } from "./share.js";
import { hideElement } from "./helper.js";

let clientNum = 1;
let room = null;

function onConnect(socket) {
    socket.on('connect', () => {
        console.log(`You connected with ID: ${socket.id}`);
    
        socket.on('client-joined-room', clientNum => {
            $('.ready-btn').prop('disabled', false);
            generatePlayerMenu(clientNum);
        });

        socket.on('client-left-room', ({ id, clientNum }) => {
            $(`.player-${clientNum}`).remove();
            console.warn(`Client ${id} left the room!`);
        });

        socket.on('ready', (clientNum, allReady) => {
            let playerDiv = $(`.player-${clientNum}`);
            if (playerDiv) {
                const readyIcon = $(`.player-${clientNum} .ready-icon`);
                readyIcon.text('check_circle');
                readyIcon.attr('data-ready', 'true');
            }

            else {
                generatePlayerMenu(clientNum, true);
            }

            if (allReady) beginRace();
        })
    
        socket.on('receive-board-click', ({boardItem, clientNum, active}) => {
            boardItem = $('#' + boardItem);
    
            if (active === true) {
                boardItem.addClass(`done-${clientNum}`);
                return;
            }
    
            boardItem.removeClass(`done-${clientNum}`);
        });
    });
}

function createRoom(socket, urlSearchParams) {
    const roomName = $('#create-room-name').val();
    socket.emit('create-room', {
        room: roomName,
        params: urlSearchParams.toString()
    });

    socket.on('create-room-response', ({res, error}) => {
        if (error) {
            console.warn(error);
            return;
        }

        room = roomName;
        clientNum = 1;

        $('#room-name-title').text(room);
        $('.ready-btn').prop('disabled', true);
        clearUI();
        generatePlayerMenu(clientNum);
        generateRaceMenu();
    });
}


function joinRoom(socket, urlSearchParams) {
    const roomName = $('#join-room-name').val();
    socket.emit('join-room', roomName);

    socket.on('join-room-response', ({res, error}) => {
        if (error) {
            console.warn(error);
            return;
        }

        room = roomName;
        clientNum = 2;
        $('#room-name-title').text(room);

        socket.emit('request-ready-status', roomName, (clients) => {
            for (const client of clients) {
                generatePlayerMenu(client.clientNum, client.ready);
            }
        });

        console.log(res.message);
        
        urlSearchParams = new URLSearchParams(res.params);
        const seed = urlSearchParams.get("seed");
        const rand = new SeededRandom(seed);

        clearUI();
        $('#seed-input').val(seed);
        updateShareURL();
        fetchAndGenerateBoard(urlSearchParams, rand);
        generateRaceMenu();
    });
}


function leaveRoom() {
    location.reload();
}


function clearUI() {
    // hide menu buttons
    hideElement('.reroll-btn');
    hideElement('button[data-bs-target="#options-sidebar"]');
    hideElement('button[data-bs-target="#share-sidebar"]');
    hideElement('button[data-bs-target="#race-sidebar"]');
    
    // close sidebar
    const raceSidebar = bootstrap.Offcanvas.getInstance('#race-sidebar');
    raceSidebar.hide();
}


function generatePlayerMenu(clientNum, ready=false) {
    const readyIcon = ready ? 'check_circle' : 'radio_button_unchecked';

    $('.players').append(
`<div class="player-container player-${clientNum} justify-center align-center">
    <div class="justify-center align-center">
        <span class="material-symbols-outlined">person</span>
        <p>Player ${clientNum}</p>
    </div>
    <span class="ready-icon material-symbols-outlined" data-ready="${ready}">${readyIcon}</span>
</div>`
    )
}

function generateRaceMenu() {
    $('.bingo-board').addClass('hide');
    $('.race-menu').removeClass('hide');
}

function handleReadyBtn(socket) {
    $('.ready-btn').css('visibility', 'hidden');

    const readyIcon = $(`.player-${clientNum} .ready-icon`);
    if (!readyIcon) return;

    readyIcon.text('check_circle');
    readyIcon.attr('data-ready', 'true');

    socket.emit('ready', room, socket.id);
}

function beginRace() {
    $('.race-menu').addClass('hide');
    $('.bingo-board').removeClass('hide');
}

export { onConnect, createRoom, joinRoom, room, clientNum, handleReadyBtn, generatePlayerMenu, leaveRoom };