import {Request, Response} from 'express';
const RoomModel = require("../models/RoomModel");

interface IRequest extends Request {
    user : {
        userId : string,
        emailId : string,
        password : string,
        username : string
    }
}

module.exports.checkRooms = async function(req : IRequest, res : Response){
    try{
        let rooms = await RoomModel.find({owner : req.user.username});
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
            roomDescription
        } = req.body;
        let room = new RoomModel({
            roomName,
            roomType,
            roomDescription,
            owner : req.user.username,
            roomMembers : [{
                username : req.user.username
            }],
            admin : [{
                username : req.user.username
            }]
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

module.exports.validateRoomId = async function(req :Request, res :Response) {
    try{
        let roomId = req.query.roomId;
        let room = await RoomModel.findById(roomId);
        console.log("room Validator", room);
        if(room){
            res.status(200).json({
                roomFound : true
            });
            return;
        }
        res.sendStatus(404);
    }
    catch(err){
        console.log(err);
        res.sendStatus(500);
    }
}