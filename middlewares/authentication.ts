import { NextFunction } from "express";
const UserModel = require("../models/UserModel");

const jwt = require("jsonwebtoken");

interface IRequest extends Express.Request {
    body : {
        emailId : string,
        password : string
    }
}

interface IJson {
    (response : {
        userCreated : boolean,
        error?: string,
        accessToken ?: string,
        refreshToken ?: string
    }): any
}

interface IResponse extends Express.Response {
    status ?:any;
    json ?: IJson;
    sendStatus ?: {(code: number):any};
    cookie ?: {(key: string, val: any, expiry: object): any}
}

const maxAge = 60*60;       //👈setting the expiry time of access token
module.exports.signInTokens = async(req: IRequest, res:IResponse, next: NextFunction) => {
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
        res.cookie("refreshToken", refreshToken, {maxAge: maxAge*24*1000});
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

function generateAccessToken (userId: string): string{
    return jwt.sign({_id : userId}, process.env.ACCESS_TOKEN_SECRET, { expiresIn : `${maxAge}s`});
}