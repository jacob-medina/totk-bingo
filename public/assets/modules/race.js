let clientNum = 1;
let room = null;

function createRoom(socket) {
    const roomName = $('#create-room-name').val();
    socket.emit('create-room', roomName);

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

function joinRoom(socket) {
    const roomName = $('#join-room-name').val();
    socket.emit('join-room', roomName);

    socket.on('join-room-response', ({res, error}) => {
        if (error) {
            console.warn(error);
            return;
        }

        room = roomName;
        clientNum = 2;
        console.log(res);
    });
}

export { createRoom, joinRoom, room, clientNum };