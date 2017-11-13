var express = require('express');
var router = express.Router();
var http = require('http');
var Library = require('../models/library');
var User = require('../models/user');
var mid = require('../middleware');
var bcrypt = require('bcrypt');

/////////////////////////////////////////
/* GET user profile. */
/////////////////////////////////////////
router.get('/', mid.requiresLogin , function(req, res, next) {
  Library.find({ user: req.session.userId})
  .exec(function (error, library) {
      if (error) {
        return next(error);
      } else {
        User.find({ "_id": req.session.userId})
        .exec(function (error, user) {
            if (error) {
              return next(error);
            } else {
              res.render('profile', {
                 title: 'Express',
                 items: library,
                 firstName: user[0].firstName,
                 lastName: user[0].lastName
               });
            }
          });
      }
    });
});

/////////////////////////////////////////
/* GET user profile bookself. */
/////////////////////////////////////////
router.get('/bookshelf', mid.requiresLogin , function(req, res, next) {
  Library.find({ user: req.session.userId})
  .where('contentType').equals('book')
  .exec(function (error, library) {
      if (error) {
        return next(error);
      } else {
        res.render('profile', {
           title: 'Express',
           items: library
         });
      }
    });
});

/////////////////////////////////////////
/* GET user profile movie collection. */
/////////////////////////////////////////
router.get('/collection', mid.requiresLogin , function(req, res, next) {
  Library.find({ user: req.session.userId})
  .where('contentType').equals('movie')
  .exec(function (error, library) {
      if (error) {
        return next(error);
      } else {
        res.render('profile', {
           title: 'Express',
           items: library
         });
      }
    });
});

/////////////////////////////////////////
/* GET user profile. */
/////////////////////////////////////////
router.get('/account', mid.requiresLogin , function(req, res, next) {
  User.find({ "_id": req.session.userId})
  .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        res.render('account', {
           title: 'Express',
           firstName: user[0].firstName,
           lastName: user[0].lastName,
           email: user[0].email,
         });
      }
    });
});

/////////////////////////////////////////
/* POST user profile. */
/////////////////////////////////////////
router.post('/account', mid.requiresLogin , function(req, res, next) {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.confirmPassword) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    return next(err);

  } else if (!req.body.password &&
             !req.body.confirmPassword) {
    // create object with form input
    var userData = {
     email: req.body.email,
     firstName: req.body.fName,
     lastName: req.body.lName,
    };

    // use schema's `update` method to insert document into Mongo
    User.findOneAndUpdate({ "_id": req.session.userId}, userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        res.render('account', {
          title: 'Express',
          firstName: req.body.fName,
          lastName: req.body.lName,
          email: req.body.email,
          applied: true
        });
      }
    });

  } else {
    // create object with form input
    var userData = {
      email: req.body.email,
      firstName: req.body.fName,
      lastName: req.body.lName,
      password: req.body.password
    };

    // Hash the password before updating the model
    bcrypt.hash(userData.password, 10, function(err, hash) {
      if (err) {
        return next(err);
      }
      userData.password = hash;

      // use schema's `update` method to insert document into Mongo
      User.findOneAndUpdate({ "_id": req.session.userId}, userData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          res.render('account', {
            title: 'Express',
            firstName: req.body.fName,
            lastName: req.body.lName,
            email: req.body.email,
            applied: true
          });
        }
      });
    });

  }
});

module.exports = router;
