const { Router } = require("express");
const roomController = require("../controllers/roomController");
const { verifyUser } = require("../middlewares/authentication");

const router = Router();

router.get('/checkRooms', verifyUser, roomController.checkRooms);

module.exports = router;