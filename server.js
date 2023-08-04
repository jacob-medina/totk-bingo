const express = require('express');
const path = require('path');

const entries = require('./lib/entries');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000;

const rooms = [];

io.on('connection', socket => {
    console.log(socket.id);

    // Create room
    socket.on('create-room', ({room, params}) => {
        if (rooms.find(rm => rm.name === room)) {
            socket.emit('create-room-response', {
                error: `Room name ${room} already in use!`
            });
            return;
        }

        console.log(params);

        rooms.push({
            name: room,
            params: params,
            clients: 1
        });

        socket.join(room);

        socket.emit('create-room-response', {
            res: `Created room ${room}`
        });
    });

    // Join room
    socket.on('join-room', (roomName) => {
        const room = rooms.find(rm => rm.name === roomName);

        if (room == null) {
            socket.emit('join-room-response', {
                error: `Could not find room: ${roomName}`
            });
            return;
        }

        if (room.clients >= 2) {
            socket.emit('join-room-response', {
                error: `Room already filled with ${room.clients} clients!`
            });
            return;
        }

        room.clients++;
        
        socket.join(roomName);

        socket.emit('join-room-response', {
            res: {
                message: `Joined room ${roomName}`,
                params: room.params
            }
        });

        console.info(rooms);
    });

    socket.on('board-click', (room, obj) => {
        socket.to(room).emit('receive-board-click', obj);
    })
});

// static public folder
app.use(express.static('public'));

// api entries
app.get('/api/entries', (req, res) => {
    res.json(entries);
});

server.listen(PORT, () => {
    console.log(`Serving static assets on http://localhost:${PORT}`);
});