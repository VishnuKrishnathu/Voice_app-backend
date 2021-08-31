// Initializing the socket connection👇

module.exports.socketConnection = async function(app : any) : Promise<void>{
    const socketio = require("socket.io");
    const { createServer } = require('http');
    const server = createServer(app);
    const io = socketio(server);

    io.on('connection', function( socket:any ) {
        console.log('We have a connection');

        socket.on('disconnect', function() {
            console.log("Disconnected");
        }) 
    });

    io.on('custom-event', function(message : string){
        console.log(message);
    });
}