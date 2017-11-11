var express = require('express');
var router = express.Router();
var http = require('http');
var axios = require('axios');
var books = require('google-books-search');
var config = require('../config.js');
var User = require('../models/user');
var mid = require('../middleware');

var bookself;
var mediaType;
var relatedContent;

/////////////////////////////////////////
/* GET home page. */
/////////////////////////////////////////
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/////////////////////////////////////////
/* GET searched galley. */
/////////////////////////////////////////
router.post('/gallery', function(req, res, next) {
  bookself = [];

  if(req.body.filter === 'books') {
    mediaType = 'books';
    // Google Books API
    books.search(req.body.search, {
      key: config.googleKey,
      type: 'books'
    }, function(error, results) {
        var googlePromise = new Promise((resolve, reject) => {
          resolve(bookself.push(results));
        });

        googlePromise.then(response => {
          res.render('gallery', {
             title: 'Express',
             items: bookself[0],
             book: true
           });

        }).catch(error => {
          console.log(error);
        });
    });
  } else if(req.body.filter === 'movies') {
    mediaType = 'movies';
    // iTunes API
    axios.get('https://itunes.apple.com/search?', {
      params: {
        term: req.body.search,
        media: 'movie'
      }

    }).then(response => {
        bookself.push(response.data);

    }).then(response => {
      res.render('gallery', {
         title: 'Express',
         items: bookself[0].results,
         book: false
       });

    }).catch(error => {
      console.log(error);
    });
  } else {
    // need to catch when search is empty
  }


});

/////////////////////////////////////////
/* GET searched gallery item details. */
/////////////////////////////////////////
router.get('/gallery/:id', function(req, res, next) {

  if(mediaType === 'books') {
    // Google Books
    var searchArray = bookself[0];
    var details = searchArray.filter(function( obj ) {
      return obj.id == req.params.id;
    });

    // TasteDive API
    axios.get('https://tastedive.com/api/similar?', {
      params: {
        q: details[0].title,
        k: config.tasteDiveKey,
        limit: 5,
        type: 'books'
      }

    }).then(response => {
        relatedContent = response.data.Similar.Results;

    }).then(response => {
        res.render('details', {
          title: 'Express',
          itemTitle: details[0].title,
          itemAuthor: details[0].authors,
          itemGenre: details[0].categories,
          itemYear: details[0].publishedDate,
          itemDescription: details[0].description,
          itemImg: details[0].thumbnail,
          related: relatedContent
        });
    }).catch(error => {
      console.log(error);
    });

  } else {
    // itunes
    var searchArray = bookself[0].results;
    var details = searchArray.filter(function( obj ) {
      return obj.trackId == req.params.id;
    });

    // TasteDive API
    axios.get('https://tastedive.com/api/similar?', {
      params: {
        q: details[0].trackName,
        k: config.tasteDiveKey,
        limit: 5,
        type: 'movies'
      }

    }).then(response => {
        relatedContent = response.data.Similar.Results;

    }).then(response => {
        res.render('details', {
          title: 'Express',
          itemTitle: details[0].trackName,
          itemAuthor: details[0].artistName,
          itemGenre: details[0].primaryGenreName,
          itemYear: details[0].releaseDate,
          itemDescription: details[0].longDescription,
          itemImg: details[0].artworkUrl100,
          itemRating: details[0].contentAdvisoryRating,
          related: relatedContent
        });
    }).catch(error => {
      console.log(error);
    });
  }


});

/////////////////////////////////////////
/* GET user account. */
/////////////////////////////////////////
router.get('/account', mid.requiresLogin , function(req, res, next) {
  res.render('account', { title: 'Express' });
});

/////////////////////////////////////////
/* GET login/register page. */
/////////////////////////////////////////
router.get('/register', mid.loggedOut, function(req, res, next) {
  res.render('register', { title: 'Express' });
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
          // req.session.userId = user._id;
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
        return res.redirect('/account');
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
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;
