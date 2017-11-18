var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var validator = require('validator');

var UserSchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: "First name is required",
      trim: true
    },
    lastName: {
      type: String,
      required: "Last name is required",
      trim: true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      validate: {
          validator: function(email) {
            return validator.isEmail(email);
          },
          message: 'Please enter a valid email.'
        }
    },
    password: {
      type: String,
      required: "Password is required",
      validate: {
          validator: function(pass) {
            return validator.isLength(pass, {min:8, max: undefined});
          },
          message: 'Password must be at least 8 characters long.'
        }
    },
    library: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Library'
    }]
});

// authenticate input against database documents
UserSchema.statics.authenticate = function(email, password, callback) {
  User.findOne({ email: email })
      .exec(function (error, user) {
        if (error) {
          return callback(error);
        } else if ( !user ) {
          var err = new Error('User not found.');
          err.status = 401;
          return callback(err);
        }
        bcrypt.compare(password, user.password , function(error, result) {
          if (result === true) {
            return callback(null, user);
          } else {
            return callback();
          }
        })
      });
}

// hash password before saving to database
UserSchema.pre('save', function(next) {
  var user = this;
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
