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