import {Request, Response} from 'express';
const RoomModel = require("../models/RoomModel");

interface IRequest extends Request {
    user : {
        _id : string,
        emailId : string,
        password : string
    }
}

module.exports.checkRooms = async function(req : IRequest, res : Response){
    try{
        let rooms = await RoomModel.find({owner : req.user._id});
        console.log("rooms", rooms)
        res.json({
            error : false,
            rooms
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            error : true
        });
    }
}

module.exports.addRoom = async function(req : IRequest, res : Response){
    try{
        let {
            roomName,
            roomType,
            voiceRoom,
            roomDescription
        } = req.body;
        let room = new RoomModel({
            roomName,
            roomType,
            voiceRoom,
            roomDescription,
            owner : req.user._id,
            roomMembers : [req.user._id]
        })
        await room.save();
        res.status(200).json({
            roomCreated : true,
            message: "Room was successfully created"
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            roomCreated : false,
            message: "Check the input fields and try again"
        })
    }
}