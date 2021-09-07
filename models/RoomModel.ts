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
    admin : [{
        username : {
            type : String,
            required: true
        }
    }],
    owner : {
        type : String,
        required: true
    },
    roomMembers : [{
        username : {
            type: String
        }
    }]
}, {
    timestamps: true
});

module.exports = model('Room', roomModel)