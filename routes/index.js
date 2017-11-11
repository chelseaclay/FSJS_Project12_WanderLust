var express = require('express');
var router = express.Router();
var http = require('http');
var axios = require('axios');
var books = require('google-books-search');
var config = require('../config.js');
// var mid = require('../middleware');

var bookself;
var mediaType;

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
    res.render('details', {
      title: 'Express',
      itemTitle: details[0].title,
      itemAuthor: details[0].authors,
      itemGenre: details[0].categories,
      itemYear: details[0].publishedDate,
      itemDescription: details[0].description,
      itemImg: details[0].thumbnail
    });
  } else {
    // itunes
    var searchArray = bookself[0].results;
    var details = searchArray.filter(function( obj ) {
      return obj.trackId == req.params.id;
    });
    res.render('details', {
      title: 'Express',
      itemTitle: details[0].trackName,
      itemAuthor: details[0].artistName,
      itemGenre: details[0].primaryGenreName,
      itemYear: details[0].releaseDate,
      itemDescription: details[0].longDescription,
      itemImg: details[0].artworkUrl100,
      itemRating: details[0].contentAdvisoryRating,
    });
  }

});

/////////////////////////////////////////
/* GET user account. */
/////////////////////////////////////////
router.get('/account', function(req, res, next) {
  res.render('account', { title: 'Express' });
});

/////////////////////////////////////////
/* GET login/register page. */
/////////////////////////////////////////
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Express' });
});

module.exports = router;
