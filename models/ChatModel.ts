import {Schema, model, Types} from 'mongoose';

const chatModel = new Schema({
    roomId : {
        type : Types.ObjectId,
        ref : 'Room',
        required : true
    },
    chats : [{
        sender : {
            type : Types.ObjectId,
            ref : 'Usersdata',
            required : true
        },
        username : {
            type : String
        },
        message : {
            type : String,
            required : true
        },
        time : {
            type : Date,
            required : true
        }
    }]
})