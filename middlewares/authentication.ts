import { NextFunction, Request, Response } from "express";
const { SQLUserModel } = require("../models/UserModel");
const jwt = require("jsonwebtoken");

// Generate access tokens ๐ 
function generateAccessToken (userId: string): string{
    return jwt.sign({_id : userId}, process.env.ACCESS_TOKEN_SECRET, { expiresIn : `${maxAge}s`});
}

interface IUserModel {
    emailId ?: string;
    password ?: string;
    username ?: string;
    userId ?: number;
}

// Interfaces๐
interface IRequest extends Request {
    body : IUserModel;
    user ?: IUserModel;
}

interface IJson {
    (response : {
        userCreated ?: boolean;     // ๐ signin handler
        error?: string;
        accessToken ?: string;      // ๐ token handler
        refreshToken ?: string;     // ๐ token handler
        verified ?: boolean;        // ๐ token handler
        loggedIn ?: boolean;        // ๐ login handler
    }): any
}

interface IResponse extends Response {
    json : IJson;
}

const maxAge = 60*60;       //๐setting the expiry time of access token


// Export modules๐ 
module.exports.signInTokens = async function( req: IRequest, res:IResponse ) {
    const {
        emailId,
        password,
        username
    } = req.body;

    try {
        let user = new SQLUserModel(emailId, password, username);
        await user.hashPassword();
        let result = await user.save();
        let ID = (result.rows.insertId);
        let accessToken = generateAccessToken(ID);
        let refreshToken = jwt.sign({_id: ID}, process.env.REFRESH_TOKEN_SECRET);
        res.cookie('refreshToken', refreshToken, {
            maxAge: 60*60*24*1000,
            httpOnly: true
        });
        res.json({
            userCreated : true,
            accessToken
        });
    }
    catch(err){
        console.log(err);
        res.status(400);
        res.json({
            userCreated: false,
            error: `An account with the email address already exists`
        });
    }
}

module.exports.refreshToken = async function (req: IRequest, res:IResponse, next:NextFunction){
    try{
        let cookie = req.cookies["refreshToken"];
        console.log(cookie);
        if(!cookie) return res.json({verified: false});
        let status = jwt.verify(cookie , process.env.REFRESH_TOKEN_SECRET);
        let new_token = generateAccessToken(status._id);
        res.status(200);
        res.json({
            verified: true,
            accessToken: new_token,
        });
    }
    catch(err){
        console.log(err);
        res.status(500);
        res.json({
            verified: false,
            error: "Try logging in again"
        })
    }
}

module.exports.verifyUser = async function (req: IRequest, res:IResponse, next: NextFunction){
    try{
        let authHeader = req.headers["authorization"];
        let token = authHeader && authHeader.split(" ")[1];
        let {_id} = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);
        let user = await SQLUserModel.findOne({userId :_id});
        req.user = user;
        next();
    }
    catch(err){
        res.status(400);
        res.json({
            verified: false,
            error: "User not verified"
        });
    }
}

module.exports.getUser = async function (req : IRequest, res: Response){
    try{
        res.status(200).json(req.user);
    }
    catch(err){
        console.log(err);
        res.sendStatus(500);
    }
}
    

module.exports.loginUser = async function (req: IRequest, res: IResponse, next: NextFunction){
    try{
        let user = await SQLUserModel.loginUser(req.body.username, req.body.password);
        let accessToken = generateAccessToken(user.userId);
        let refreshToken = jwt.sign({_id: user.userId}, process.env.REFRESH_TOKEN_SECRET);
        res.status(200);
        res.cookie('refreshToken', refreshToken, {
            maxAge: 60*60*24*1000,
            httpOnly: true
        });
        res.json({
            loggedIn : true,
            accessToken
        });
    }
    catch(err){
        res.status(500);
        res.json({
            loggedIn: false,
            error: err.message
        });
    }
}

module.exports.logOutfunction = async (req : IRequest, res : IResponse, next : NextFunction) => {
    res.status(200);
    res.cookie('refreshToken', "", {
        httpOnly: true
    });
    res.json({
        loggedIn: false
    });
}

module.exports.validateUsername = async function(req : Request, res : Response){
    let username = req.query.username;
    try{
        let username_db = await SQLUserModel.findOne({
            username
        });
        if(!username_db){
            res.status(200).json({
                error : false,
                message: "Username approved"
            })
            return;
        }
        res.status(400).json({
            error : true,
            message : "Username already exists"
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            error : true,
            message : "Error in the backend"
        })
    }
}

module.exports.getUsernames = async function getUsername(req : IRequest, res: Response){
    try{
        let { username, userId } = req.user;
        let { value } = req.query;
        let result = await SQLUserModel.findUsingRegex('username', value, username, userId);
        console.log(result);
        res.status(200).json({
            result
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            result : []
        });
    }
}