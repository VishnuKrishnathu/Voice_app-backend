const {Router} = require("express")
const {signInTokens, refreshToken} = require("../middlewares/authentication");

const router = Router();

router.post('/signin', signInTokens);

router.post('/refresh', refreshToken);

module.exports = router;