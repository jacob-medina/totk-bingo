function startRace(socket) {
    socket.emit('new-race', {seed: '123456'});
}

export { startRace };