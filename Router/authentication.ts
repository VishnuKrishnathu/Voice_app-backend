const {Router} = require("express");
import { Request, Response } from "express";

const {
    signInTokens, 
    refreshToken,
    verifyUser,
    loginUser,
    logOutfunction
} = require("../middlewares/authentication");

const router = Router();

router.get('/', function(req : Request,res : Response){res.send("Hello World")});

router.post('/signin', signInTokens);

router.get('/refresh', refreshToken);

router.post('/login', loginUser);

router.get('/logout', logOutfunction)

module.exports = router;