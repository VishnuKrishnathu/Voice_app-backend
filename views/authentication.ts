const {Router} = require("express")
const {
    signInTokens, 
    refreshToken,
    verifyUser,
    loginUser,
    logOutfunction
} = require("../middlewares/authentication");

const router = Router();

router.post('/signin', signInTokens);

router.get('/refresh', refreshToken);

router.post('/login', loginUser);

router.get('/logout', logOutfunction)

module.exports = router;