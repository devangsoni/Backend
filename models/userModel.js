/* Requier npm packages */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const validateEmail = function (email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email)
};

const userSchema = new Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  username: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validateEmail, 'Please fill a valid email address'],
  },
  password: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false }
})


/* save encrypted password */
userSchema.pre('save', function (next) {
  var user = this;
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  }
  else {
    return next();
  }
});


/* compare password method */
userSchema.methods.comparePassword = function (passw, cb) {
  bcrypt.compare(passw, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};


// userSchema.methods.getProfileByUserId = function (userId) {
//   return this.findOne({
//     _id: mongoose.Types.ObjectId(userId)
//   }).select({
//     "_id": 1,
//     "createdDate": 1,
//     "updatedDate": 1,
//     "email": 1,
//     "dateOfBirth": 1,
//     "username": 1,
//     "lastName": 1,
//     "firstName": 1
//   }).exec();
// }

var User = mongoose.model('User', userSchema);
module.exports = User;