const socketio = require("socket.io");
import { Socket } from "socket.io";

// defining the user object model
interface IUserModel {
    emailId ?: string;
    password ?: string;
    username : string;
}

function SocketServer (server : any){
    const io = socketio(server, {
        cors : {
            origin : "http://localhost:3000"
        }
    });

    // defining the user object model
    interface IUserModel {
        emailId ?: string;
        password ?: string;
        username : string;
    }

    io.on('connection', async function( socket: Socket) {
        console.log('We have a connection!!!', socket.id);

        socket.on('disconnect', function() {
            console.log("Disconnected");
        }) 

        socket.on('send-message', function(message : string, roomId :string, userData : IUserModel){
            if(message == "" || roomId == "") return;
            console.log("message by socket >>>>", message);
            socket.to(roomId).emit("receive-message", {
                sender : userData.username,
                message,
                messageId : Math.floor( Math.random()*Date.now()+Math.random())
            });
        });

        socket.on('join-room', function(roomId : string){
            console.log("Room joined", roomId);
            socket.join(roomId);
        })
    });
}

module.exports = SocketServer;