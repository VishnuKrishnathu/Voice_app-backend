const express = require("express");
const authentication = require("./views/authentication");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

const PORT = process.env.PORT;

// Connect to mongodb database👇
let username = process.env.MONGO_USER;
let password = process.env.MONGO_PASSWORD;
mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.ragko.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected to the database");
});

// connecting the views 👇
app.use(authentication);


app.listen(PORT, ()=> {
    console.log(`server running on port ${PORT}`)
})