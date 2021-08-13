const {Router} = require("express")
const {signInTokens} = require("../middlewares/authentication");

const router = Router();

router.post('/signin', signInTokens);

module.exports = router;