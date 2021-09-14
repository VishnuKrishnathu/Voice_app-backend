import { NextFunction, Request, Response } from "express";
const { SQLUserModel } = require("../models/UserModel");
import { FriendlistSchema } from '../models/FriendlistsModel';


interface IUserModel {
    emailId ?: string;
    password ?: string;
    username ?: string;
    userId ?: number;
}

interface IRequest extends Request{
    user : IUserModel
}

module.exports.sendRequest = async function(req :IRequest, res :Response){
    try{
        let { username } = req.body;
        let user = req.user;
        if(username == user.username){
            res.sendStatus(404);
            return;
        }
        let result = await SQLUserModel.findOne({username});
        console.log("send request >>>", result);
        let addFriend = new FriendlistSchema(user.userId, result.userId);
        await addFriend.sendRequest();
        res.status(200).json({
            message : 'User added to friendlist successfuly',
            requestSent: true
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            requestSent: false,
            message : 'Error adding friend, try again later'
        });
    }
}

module.exports.acceptRequest = async function(req :IRequest, res :Response){
    try{
        let { friendId } = req.body;
        let { userId } = req.user;
        let result = await FriendlistSchema.acceptRequest(userId, friendId);
        res.status(200).json({
            message : "Friend request accepted"
        });
    }
    catch(err){
        console.log(err);
        res.sendStatus(500);
    }
}

module.exports.searchFriends = async function(req :IRequest, res :Response){
    try{
        let { value } = req.query;
        let { userId, username } = req.user;
        let result = await SQLUserModel.findFriendsUsingRegex(value, username, userId);
        res.status(200).json({result});
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
}