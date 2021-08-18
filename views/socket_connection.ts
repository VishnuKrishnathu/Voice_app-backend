// const {Router} = require('express');
const io = require('socket.io')(5050, {
    cors: {
        origin : [`http://localhost:3000`]
    }
});

io.on('connection', function(socket: any) {
    if(!socket.auth) return;
    console.log(socket.id);
    socket.on('custom-event', (message: string) => {
        console.log(message);
    });
});