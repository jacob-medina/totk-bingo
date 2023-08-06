const express = require('express');
const path = require('path');

const entries = require('./lib/entries');
// const { clientNum } = require('./public/assets/modules/race');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000;

const rooms = [];

// returns the room object with a given name
function getRoom(roomName) {
    return rooms.find(room => room.name === roomName);
}

// returns the number of clients connected to a room
function getAmountClients(room) {
    amountConnected = room.clients.reduce((sum, client) => {
        return client.connected ? sum + 1: sum; },
        0);
    return amountConnected;
}

// returns the number of clients who are ready in the waiting room
function getAmountReadyClients(room) {
    amountReady = room.clients.reduce((sum, client) => {
        return client.ready ? sum + 1: sum; },
        0);
    return amountReady;
}

class Client {
    constructor(id, num, connected=true) {
        this.id = id;
        this.num = num;
        this.connected = connected;
        this.timeout = null;
        this.ready = false;
    }
}


io.on('connection', socket => {
    console.info(`${socket.id} joined.`);

    // Create room
    socket.on('create-room', ({room, params}) => {
        if (getRoom(room)) {
            socket.emit('create-room-response', {
                error: `Room name ${room} already in use!`
            });
            return;
        }

        rooms.push({
            name: room,
            params: params,
            clients: [new Client(socket.id, 1)]
        });
        console.info(`Room "${room}" created by ${socket.id}`);

        socket.join(room);

        socket.emit('create-room-response', {
            res: `Created room ${room}`
        });
    });


    // Join room
    socket.on('join-room', (roomName) => {
        const room = getRoom(roomName);

        if (room == null) {
            socket.emit('join-room-response', {
                error: `Could not find room: ${roomName}`
            });
            return;
        }

        if (getAmountClients(room) >= 2) {
            socket.emit('join-room-response', {
                error: `Room already filled with ${getAmountClients(room)} clients!`
            });
            return;
        }

        // let clientNum;
        // let unconnectedClient = room.clients.find(client => !client.connected);

        // if (unconnectedClient) {
        //     unconnectedClient = new Client(socket.id, unconnectedClient.num);
        //     clientNum = unconnectedClient.num;
        // }

        // else {
        room.clients.push(new Client(socket.id, room.clients.length + 1));
        let clientNum = room.clients.length;
        
        socket.join(roomName);

        socket.to(roomName).emit('client-joined-room', clientNum);

        socket.emit('join-room-response', {
            res: {
                message: `Joined room ${roomName}`,
                params: room.params
            }
        });

        console.info(rooms);
    });


    socket.on('ready', (roomName, id) => {
        const room = getRoom(roomName);
        const client = room.clients.find(c => c.id === id);

        client.ready = true;

        const allReady = getAmountReadyClients(room) >= getAmountClients(room);

        io.in(roomName).emit('ready', client.num, allReady);
    });

    socket.on('request-ready-status', (roomName, cb) => {
        const room = getRoom(roomName);

        const clients = [];

        for (const client of room.clients) {
            clients.push({
                clientNum: client.num,
                ready: client.ready
            });
        }

        cb(clients);
    })


    socket.on('disconnecting', reason => {
        for (const roomName of socket.rooms) {
            if (roomName === socket.id) continue;  // pass over default room

            const room = getRoom(roomName);
            const clientIndex = room.clients.findIndex(c => c.id === socket.id);
            const client = room.clients[clientIndex];

            client.connected = false;
            room.clients.splice(clientIndex, 1);
            
            socket.to(roomName).emit('client-left-room', {
                id: socket.id,
                clientNum: client.num
            });
        }
        console.log(`Client ${socket.id} disconnected.`);
    });


    socket.on('board-click', (room, obj) => {
        socket.to(room).emit('receive-board-click', obj);
    });
});

// continually delete rooms that have no connections
setInterval(() => {
    for (room of rooms) {
        // cancel if there are still connected clients in room
        if (getAmountClients(room) > 0) continue;

        // remove room
        rooms.splice(rooms.findIndex(rm => rm.name === room.name), 1);
        console.info(`Room "${room.name}" deleted. No more clients connected.`);
    }
}, 5000);

// static public folder
app.use(express.static('public'));

// api entries
app.get('/api/entries', (req, res) => {
    res.json(entries);
});

server.listen(PORT, () => {
    console.log(`Serving static assets on http://localhost:${PORT}`);
});