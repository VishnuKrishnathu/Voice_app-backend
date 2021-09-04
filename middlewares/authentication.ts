import { NextFunction, Request, Response } from "express";
const UserModel = require("../models/UserModel");

const jwt = require("jsonwebtoken");

// Generate access tokens 👇 
function generateAccessToken (userId: string): string{
    return jwt.sign({_id : userId}, process.env.ACCESS_TOKEN_SECRET, { expiresIn : `${maxAge}s`});
}

interface IUserModel {
    emailId ?: string;
    password ?: string;
    username ?: string;
}

// Interfaces👇
interface IRequest extends Request {
    body : IUserModel;
    user ?: IUserModel;
}

interface IJson {
    (response : {
        userCreated ?: boolean;     // 👈 signin handler
        error?: string;
        accessToken ?: string;      // 👈 token handler
        refreshToken ?: string;     // 👈 token handler
        verified ?: boolean;        // 👈 token handler
        loggedIn ?: boolean;        // 👈 login handler
    }): any
}

interface IResponse extends Response {
    json : IJson;
}

const maxAge = 60*60;       //👈setting the expiry time of access token


// Export modules👇 
module.exports.signInTokens = async function( req: IRequest, res:IResponse ) {
    const {
        emailId,
        password,
        username
    } = req.body;

    try {
        const user = new UserModel({
            emailId,
            password,
            username
        });
        await user.save();
        let accessToken = generateAccessToken(user._id);
        let refreshToken = jwt.sign({_id: user._id}, process.env.REFRESH_TOKEN_SECRET);
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
        res.status(400);
        res.json({
            userCreated: false,
            error: `An account with the email address already exists`
        });
    }
}

module.exports.refreshToken = function (req: IRequest, res:IResponse, next:NextFunction){
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
        let user = await UserModel.findById(_id);
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

module.exports.loginUser = async function (req: IRequest, res: IResponse, next: NextFunction){
    try{
        let user = await UserModel.login(req.body.username, req.body.password);
        let accessToken = generateAccessToken(user._id);
        let refreshToken = jwt.sign({_id: user._id}, process.env.REFRESH_TOKEN_SECRET);
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
        let username_db = await UserModel.findOne({
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