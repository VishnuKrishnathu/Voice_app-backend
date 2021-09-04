import {Schema, model, Types} from 'mongoose';

const roomModel = new Schema({
    roomName : {
        type: String,
        required: true
    },
    roomType : {
        type: String,
        required: true
    },
    roomDescription : {
        type: String,
        default: ""
    },
    chatroom : {
        type: Boolean,
        default : true 
    },
    voiceRoom : {
        type: Boolean,
        default : false
    },
    admin : [{
        type: Types.ObjectId,
        ref: 'Usersdata'
    }],
    owner : {
        type : Types.ObjectId,
        ref: 'Usersdata',
        required: true
    },
    roomMembers : [{
        type: Types.ObjectId,
        ref: 'Usersdata',
        required : true
    }]
});

module.exports = model('Room', roomModel)