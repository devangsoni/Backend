/* Requier npm packages */
var express = require('express');
var router = express.Router();

// connect database
var dbConnection = require('./../config/dbConnection');

/* Requier controllers */
const userController = require('./../controllers/userController');

/* Requier middlewares for check token */
const middlewares = require('./../middlewares/checkToken');

/* Check ping */
router.get('/ping', function (req, res, next) {
  return res.status(200).json({ sucess: true });
});

/* Login api */
router.post('/login', userController.login);

/* User create api */
router.post('/register', userController.register);

/* User get profile by userId api */
router.get('/getProfile', middlewares.validateToken, userController.getProfileByUserId);

/* User Edit Profie Api for  */
router.put('/editProfile', middlewares.validateToken, userController.editProfile);

/* Get All User Api with search */
router.get('/getAllUsers/:firstName', middlewares.validateToken, userController.searchUserByFirstName);

/* User Delete api */
router.delete('/deleteUser', middlewares.validateToken, userController.deleteUser);

module.exports = router;
