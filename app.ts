const express = require("express");
const authentication = require("./Router/authentication");
const rooms = require("./Router/rooms");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require('http');
const SocketServer = require('./socket');
const users = require('./Router/users');

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['https://chatapplication-vishnukrishnathu.vercel.app', 'https://chatapplication-git-main-vishnukrishnathu.vercel.app', 'https://chatapplication-puce.vercel.app'],
    credentials: true
}));

const PORT = process.env.PORT;

// connecting the views 👇
app.use(rooms);
app.use(authentication);
app.use(users);

// calling the socket connection function👇
const server = http.createServer(app);
SocketServer(server);

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
