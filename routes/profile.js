var express = require('express');
var router = express.Router();
var http = require('http');
var Library = require('../models/library');
var mid = require('../middleware');

/////////////////////////////////////////
/* GET user profile. */
/////////////////////////////////////////
router.get('/', mid.requiresLogin , function(req, res, next) {
  Library.find({ user: req.session.userId})
  .exec(function (error, library) {
      if (error) {
        return next(error);
      } else {
        res.render('account', {
           title: 'Express',
           items: library
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
        res.render('account', {
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
        res.render('account', {
           title: 'Express',
           items: library
         });
      }
    });
});

module.exports = router;
