import { fetchAndGenerateBoard } from "./board.js";
import { SeededRandom } from "./SeededRandom.js";
import { updateShareURL } from "./share.js";

let clientNum = 1;
let room = null;

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
        console.log(res);
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
        console.log(res.message);
        
        urlSearchParams = new URLSearchParams(res.params);
        const seed = urlSearchParams.get("seed");
        const rand = new SeededRandom(seed);
        $('#seed-input').val(seed);
        updateShareURL();
        console.log(seed);
        fetchAndGenerateBoard(urlSearchParams, rand);
    });
}

export { createRoom, joinRoom, room, clientNum };