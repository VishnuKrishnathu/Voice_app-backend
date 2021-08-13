import { NextFunction } from "express";
const UserModel = require("../models/UserModel");

const jwt = require("jsonwebtoken");

// Generate access tokens 👇 
function generateAccessToken (userId: string): string{
    return jwt.sign({_id : userId}, process.env.ACCESS_TOKEN_SECRET, { expiresIn : `${maxAge}s`});
}

// Interfaces👇
interface IRequest extends Express.Request {
    body : {
        emailId : string,
        password : string
    },
    cookies : any
}

interface IJson {
    (response : {
        userCreated ?: boolean;
        error?: string;
        accessToken ?: string;
        refreshToken ?: string;
        verified ?: boolean;
    }): any
}

interface IResponse extends Express.Response {
    status ?:any;
    json ?: IJson;
    sendStatus ?: {(code: number):any};
    cookie ?: {(key: string, val: any, expiry: object): any}
}

const maxAge = 60*60;       //👈setting the expiry time of access token


// Export modules👇 
module.exports.signInTokens = async( req: IRequest, res:IResponse ) => {
    const {
        emailId,
        password
    } = req.body;

    try {
        const user = new UserModel({
            emailId,
            password
        });
        await user.save();
        let accessToken = generateAccessToken(user._id);
        let refreshToken = jwt.sign({_id: user._id}, process.env.REFRESH_TOKEN_SECRET);
        res.cookie("refreshToken", refreshToken, {
            maxAge: maxAge*24*1000,
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
            error: "An account with the email address already exists"
        });
    }
}

module.exports.refreshToken = function (req: IRequest, res:IResponse, next:NextFunction){
    try{
        let cookie = req.cookies["refreshToken"];
        if(!cookie) return res.json({verified: false});
        let status = jwt.verify(cookie , process.env.REFRESH_TOKEN_SECRET);
        let new_token = generateAccessToken(status._id);
        res.status(200);
        res.json({
            verified: true,
            accessToken: new_token
        })
    }
    catch(err){
        console.log(err);
        res.sendStatus(404);
    }
}