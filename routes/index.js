var express = require('express');
var router = express.Router();
var http = require('http');
var User = require('../models/user');
var mid = require('../middleware');

/////////////////////////////////////////
/* GET home page. */
/////////////////////////////////////////
router.get('/', function(req, res, next) {
  res.render('index', { title: 'WanderLust' });
});

/////////////////////////////////////////
/* GET about page. */
/////////////////////////////////////////
router.get('/about', function(req, res, next) {
  res.render('about', { title: 'WanderLust | About' });
});

/////////////////////////////////////////
/* GET login/register page. */
/////////////////////////////////////////
router.get('/register', mid.loggedOut, function(req, res, next) {
  res.render('register', {
    title: 'WanderLust | Register',
    signin: true
  });
});

/////////////////////////////////////////
/* POST register page. */
/////////////////////////////////////////
router.post('/register', function(req, res, next) {
  if (req.body.email &&
    req.body.fName &&
    req.body.lName &&
    req.body.password &&
    req.body.confirmPassword) {

      // confirm that user typed same password twice
      if (req.body.password !== req.body.confirmPassword) {
        var err = new Error('Passwords do not match.');
        err.status = 400;
        return next(err);
      }

      // create object with form input
      var userData = {
        email: req.body.email,
        firstName: req.body.fName,
        lastName: req.body.lName,
        password: req.body.password
      };

      // use schema's `create` method to insert document into Mongo
      User.create(userData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          req.session.userId = user._id;
          return res.redirect('/');
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});

/////////////////////////////////////////
/* POST login page. */
/////////////////////////////////////////
router.post('/login', function(req, res, next) {
  if (req.body.loggedEmail && req.body.loggedPassword) {
    User.authenticate(req.body.loggedEmail, req.body.loggedPassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      }  else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('Email and password are required.');
    err.status = 401;
    return next(err);
  }
});

/////////////////////////////////////////
/* POST logout page. */
/////////////////////////////////////////
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        var err = new Error('Oops, something went wrong. Please try again later.');
        err.status = 500;
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;
