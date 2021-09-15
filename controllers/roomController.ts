import {Request, Response} from 'express';
const {RoomModel, SQLRoomMember} = require("../models/RoomModel");
import {Types} from "mongoose";

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
        room = await room.save();
        // ading admin to SQL database
        await SQLRoomMember.addAdmin(room._id, req.user.userId);
        res.status(200).json({
            roomCreated : true,
            message: "Room was successfully created"
        });
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

module.exports.getRoomInfo = async function(req :Request, res :Response){
    try{
        let { roomId } = req.body;
        let result = await RoomModel.findById(roomId);
        let members = await SQLRoomMember.findMembersByRoomId(roomId);
        if(!result){
            res.sendStatus(404);
            return;
        }
        res.status(200).json({
            result,
            members
        });
    }
    catch(err){
        console.log(err);
        res.sendStatus(500);
    }
}

interface ISearchResult {
    value : number,
    label: string,
    friendId : null | number,
    requestSent : null | number,
    foreignUserID : null | number
}

module.exports.editRoom = async function(req :IRequest, res :Response){
    try{
        let {members, roomName, roomId} = req.body;
        let room = await RoomModel.findById(roomId);
        console.log(members, roomName);
        if(members){
            let memberAdd = new SQLRoomMember(roomId, members, "value");
            await memberAdd.addMember();
            members.forEach(function (member :ISearchResult) {
                room.roomMembers.push({
                    _id : new Types.ObjectId(),
                    username : member.label
                })
            })
        }
        if(roomName){
            room.roomName = roomName;
        }
        console.log("editing Room", room);
        await room.save()
        res.sendStatus(200);
    }
    catch(err){
        console.log(err);
        res.sendStatus(500);
    }
}

module.exports.deleteRoom = async function(req :IRequest, res :Response){
    try{
        let { roomId } = req.body;
        let rooms = await RoomModel.find({owner : req.user.username});
        await RoomModel.deleteOne({_id : roomId});
        await SQLRoomMember.deleteRoom(roomId);
        res.sendStatus(200);
    }
    catch(err){
        console.log(err);
        res.sendStatus(500);
    }
}