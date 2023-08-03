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
    socket.on('new-race', (data) => {
        console.log(data);
    })
})

// static public folder
app.use(express.static('public'));

// api entries
app.get('/api/entries', (req, res) => {
    res.json(entries);
});

server.listen(PORT, () => {
    console.log(`Serving static assets on http://localhost:${PORT}`);
});