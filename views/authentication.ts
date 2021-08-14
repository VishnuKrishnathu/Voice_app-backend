const {Router} = require("express")
const {
    signInTokens, 
    refreshToken,
    verifyUser,
    loginUser
} = require("../middlewares/authentication");

const router = Router();

router.post('/signin', signInTokens);

router.get('/refresh', refreshToken);

router.post('/login', loginUser);

module.exports = router;