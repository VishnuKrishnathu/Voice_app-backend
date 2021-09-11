import { Router } from 'express';
const Authentication = require('../middlewares/authentication');
const UsersController = require('../controllers/usersController');

const router = Router();

router.post('/sendFriendRequest', Authentication.verifyUser, UsersController.sendRequest);

module.exports = router;