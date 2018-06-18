/* Requier npm packages */
const jwt = require('jsonwebtoken');
const http = require("http");
const request = require('request');
const mongoose = require('mongoose');


/* Requier config */
const config = require('./../config/config.constants');

/* Requier models */
const UserModel = require('./../models/userModel');


/******************************************* Login *******************************************/

module.exports.login = function (req, res) {
  if (!req.body.username.trim() || !req.body.password) {
    return res.status(400).json({ success: false, message: 'Given parameters are invalid' });
  }

  // find user from databse by email or username

  let loginQuery = { $or: [{ email: req.body.username }, { username: req.body.username }], isDeleted: false };
  UserModel.findOne(loginQuery, function (err, resultUser) {
    if (err) {
      return res.status(500).json({ success: false, message: err });
    }
    if (resultUser != null) {
      // bcrypt and compare password
      resultUser.comparePassword(req.body.password, function (err, isMatched) {
        if (isMatched && !err) {
          let encodedData = {
            userId: resultUser._id,
            generatedTime: Date.now(),
          }
          // Generate token
          let token = jwt.sign(encodedData, config.secret);
          let userDTO = {
            firstName: resultUser.firstName,
            lastName: resultUser.lastName,
            email: resultUser.email,
            username: resultUser.username,
            dateOfBirth: resultUser.dateOfBirth
          }
          return res.status(200).json({ success: true, data: { token: token, user: userDTO } });

        } else {
          return res.status(400).json({ success: false, message: 'Email or Password is invalid' });
        }
      })

    } else {
      return res.status(400).json({ success: false, message: 'Email or Password is invalid' });
    }
  });
}

/**************************************** User Register ****************************************/

module.exports.register = function (req, res) {
  console.log(req.body);
  if (!req.body.email || !req.body.username || !req.body.firstName || !req.body.lastName || !req.body.password || !req.body.dateOfBirth) {
    return res.status(400).json({ success: false, message: 'Given parameters are invalid' });
  }
  // check email and username into database
  UserModel.findOne({ $or: [{ 'email': req.body.email }, { 'username': req.body.username }] }, function (err, resultUser) {
    if (err) {
      return res.status(500).json({ success: false, message: error });
    }
    if (resultUser == null) {
      let dateOfBirth = new Date(req.body.dateOfBirth.trim());
      const userObj = {
        email: req.body.email.trim(),
        firstName: req.body.firstName.trim(),
        lastName: req.body.lastName.trim(),
        username: req.body.username.trim(),
        dateOfBirth: dateOfBirth.setDate(dateOfBirth.getDate()),
        password: req.body.password
      }
      // Save into database
      let user = new UserModel(userObj);
      user.save(function (error, resultUserCreated) {
        if (error) {
          return res.status(500).json({ success: false, message: error });
        }
        return res.status(200).json({ success: true, message: "User Registered SuccessFully" });

      })

    } else {
      return res.status(403).json({ success: false, message: 'Sorry this email or username is all ready taken' });
    }
  })

}

// get user profile details
module.exports.getProfileByUserId = function (req, res) {
  UserModel.findOne({ _id: mongoose.Types.ObjectId(req.decodedData.userId) }, function (err, resultUser) {
    if (err) {
      console.log(error);
      return res.status(500).json({ message: 'internal server error' });
    }
    if (resultUser !== null) {
      const userObj = {
        email: resultUser.email,
        firstName: resultUser.firstName,
        lastName: resultUser.lastName,
        username: resultUser.username,
        dateOfBirth: resultUser.dateOfBirth,
      }
      return res.status(200).json({ 'message': "User profile retrived successfully", user: userObj });
    }
  })
}

// edit user
module.exports.editProfile = function (req, res) {
  UserModel.findByIdAndUpdate({ _id: req.decodedData.userId }, req.body, { new: true, runValidators: true }, function (err, resultUpdatedUser) {
    if (err) {
      return res.status(400).json({ 'message': 'Internal server error.' });
    }
    let user = {
      firstName: resultUpdatedUser.firstName,
      lastName: resultUpdatedUser.lastName,
      email: resultUpdatedUser.email,
      username: resultUpdatedUser.username,
      dateOfBirth: resultUpdatedUser.dateOfBirth
    }
    return res.status(200).json({ 'message': "User updated successfully", userData: user });
  });
};

// gat all user with search on first name

module.exports.searchUserByFirstName = function (req, res) {

  UserModel.aggregate([
    {
      $match: {
        firstName: { $regex: req.params.firstName, $options: "$i" },
        isDeleted: false
      }
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        email: 1,
        username: 1,
        dateOfBirth: 1,
        createdDate: 1,
        updatedDate: 1,
      }
    },
  ]).exec(function (err, result) {
    if (err) {
      return res.status(500).json({ success: false, message: err });
    }
    return res.status(200).json({ success: true, data: result });
  })
}

//delete user by userid

module.exports.deleteUser = function (req, res) {

  let query = { _id: req.decodedData.userId };
  let update = {
    isDeleted: true,
  };
  let option = { new: true };

  UserModel.findOneAndUpdate(query, update, option, function (err, resultUserUpdated) {
    if (err) {
      return res.status(500).json({ success: false, message: err });
    }
    return res.status(200).json({ success: true, message: "User deleted Successfully" });
  })
};
