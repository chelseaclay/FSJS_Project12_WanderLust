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
        var err = new Error('Oops, something went wrong. Please try again later.');
        err.status = 500;
        return next(err);
      } else {
        User.find({ "_id": req.session.userId})
        .exec(function (error, user) {
            if (error) {
              return next(error);
            } else {
              res.render('profile', {
                 title: 'WanderLust | Profile',
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
        var err = new Error('Oops, something went wrong. Please try again later.');
        err.status = 500;
        return next(err);
      } else {
        User.find({ "_id": req.session.userId})
        .exec(function (error, user) {
            if (error) {
              return next(error);
            } else {
              res.render('profile', {
                 title: 'WanderLust | Bookshelf',
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
/* GET user profile movie collection. */
/////////////////////////////////////////
router.get('/collection', mid.requiresLogin , function(req, res, next) {
  Library.find({ user: req.session.userId})
  .where('contentType').equals('movie')
  .exec(function (error, library) {
      if (error) {
        var err = new Error('Oops, something went wrong. Please try again later.');
        err.status = 500;
        return next(err);
      } else {
        User.find({ "_id": req.session.userId})
        .exec(function (error, user) {
            if (error) {
              return next(error);
            } else {
              res.render('profile', {
                 title: 'WanderLust | Movie Collection',
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
/* GET user account. */
/////////////////////////////////////////
router.get('/account', mid.requiresLogin , function(req, res, next) {
  User.find({ "_id": req.session.userId})
  .exec(function (error, user) {
      if (error) {
        var err = new Error('Oops, something went wrong. Please try again later.');
        err.status = 500;
        return next(err);
      } else {
        res.render('account', {
           title: 'WanderLust | Account Settings',
           firstName: user[0].firstName,
           lastName: user[0].lastName,
           email: user[0].email,
         });
      }
    });
});

/////////////////////////////////////////
/* POST user account. */
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
        var err = new Error('Oops, something went wrong. Please try again later.');
        err.status = 500;
        return next(err);
      } else {
        res.render('account', {
          title: 'WanderLust | Account Settings',
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
    bcrypt.hash(userData.password, 10, function(error, hash) {
      if (error) {
        var err = new Error('Oops, something went wrong. Please try again later.');
        err.status = 500;
        return next(err);
      }
      userData.password = hash;

      // use schema's `update` method to insert document into Mongo
      User.findOneAndUpdate({ "_id": req.session.userId}, userData, function (error, user) {
        if (error) {
          var err = new Error('Oops, something went wrong. Please try again later.');
          err.status = 500;
          return next(err);
        } else {
          res.render('account', {
            title: 'WanderLust | Account Settings',
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

/////////////////////////////////////////
/* Delete item from user Library. */
/////////////////////////////////////////
router.get('/:id/delete', mid.requiresLogin , function(req, res, next) {
  Library.find({ "user": req.session.userId, "itemId": req.params.id})
  .exec(function (error, library) {
      if (error) {
        var err = new Error('Oops, something went wrong. Please try again later.');
        err.status = 500;
        return next(err);
      } else {
        Library.remove({"_id": library[0]._id}, function (error, user) {
          if (error) {
            return next(error);
          } else {
            res.redirect('/profile');
          }
        });
      }
    });
});

module.exports = router;
