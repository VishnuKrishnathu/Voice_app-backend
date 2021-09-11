const {Router} = require("express");
import { Request, Response } from "express";

const {
    signInTokens, 
    refreshToken,
    loginUser,
    logOutfunction,
    validateUsername,
    verifyUser,
    getUser,
    getUsernames
} = require("../middlewares/authentication");

const router = Router();

router.get('/', function(req : Request,res : Response){res.send("Hello World")});

router.post('/signin', signInTokens);

router.get('/refresh', refreshToken);

router.post('/login', loginUser);

router.get('/logout', logOutfunction);

router.get('/validateUsername', validateUsername);

router.get('/getUser', verifyUser, getUser);

router.get('/getUsernames', verifyUser, getUsernames);

module.exports = router;