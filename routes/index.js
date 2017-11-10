var express = require('express');
var router = express.Router();
var http = require('http');
var axios = require('axios');
// var mid = require('../middleware');

var bookself;

/////////////////////////////////////////
/* GET home page. */
/////////////////////////////////////////
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/////////////////////////////////////////
/* GET searched galley. */
/////////////////////////////////////////
router.get('/gallery', function(req, res, next) {
  // iTunes API
  axios.get('https://itunes.apple.com/search?', {
    params: {
      term: req.query.search,
      media: 'movie'
    }

  }).then(response => {
      bookself.push(response.data);

    })
    .then(response => {
      res.render('gallery', {
         title: 'Express',
         items: bookself[0].results
       });
    })
    .catch(error => {
      console.log(error);
    });

});

/////////////////////////////////////////
/* GET searched gallery item details. */
/////////////////////////////////////////
router.get('/gallery/:id', function(req, res, next) {
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
