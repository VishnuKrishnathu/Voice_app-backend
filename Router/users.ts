import { Router } from 'express';
const Authentication = require('../middlewares/authentication');
const UsersController = require('../controllers/usersController');

const router = Router();

router.post('/sendFriendRequest', Authentication.verifyUser, UsersController.sendRequest);

router.post('/acceptRequest', Authentication.verifyUser, UsersController.acceptRequest);

router.get('/searchFriends', Authentication.verifyUser, UsersController.searchFriends);

router.post('/getProfileInformation', Authentication.verifyUser, UsersController.getProfileInformation);

module.exports = router;