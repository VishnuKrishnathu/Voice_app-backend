const express = require("express");
const authentication = require("./Router/authentication");
const rooms = require("./Router/rooms");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const socketio = require("socket.io");
const http = require('http');

// types import 👇
import { Socket } from 'socket.io';
import {Response, Request} from "express";

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

const PORT = process.env.PORT;

// connecting the views 👇
app.use(rooms);
app.use(authentication);

// calling the socket connection function👇
const server = http.createServer(app);
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

// Connect to mongodb database👇
let username = process.env.MONGO_USER;
let password = process.env.MONGO_PASSWORD;
mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.ragko.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected to the database");
});


server.listen(PORT, ()=> {
    console.log(`server running on port ${PORT}`)
})