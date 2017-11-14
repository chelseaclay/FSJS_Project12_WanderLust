var express = require('express');
var router = express.Router();
var axios = require('axios');
var books = require('google-books-search');
var config = require('../config.js');
var Library = require('../models/library');
var mid = require('../middleware');

var bookself;
var mediaType;
var details;
var relatedContent;

/////////////////////////////////////////
/* GET searched. */
/////////////////////////////////////////
router.post('/', function(req, res, next) {
  bookself = [];

  if(!req.body.search){
      // need to catch when search is empty
      console.log(error);
  } else {
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
    }
  }


});

/////////////////////////////////////////
/* GET searched item details. */
/////////////////////////////////////////
router.get('/:id', function(req, res, next) {

  if(mediaType === 'books') {
    // Google Books
    var searchArray = bookself[0];
    details = searchArray.filter(function( obj ) {
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
          itemId: details[0].id,
          related: relatedContent,
          contentType: 'Book',
          added: false
        });
    }).catch(error => {
      console.log(error);
    });

  } else {
    // itunes
    var searchArray = bookself[0].results;
    details = searchArray.filter(function( obj ) {
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
          itemId: details[0].trackId,
          related: relatedContent,
          contentType: 'Movie',
          added: false
        });
    }).catch(error => {
      console.log(error);
    });
  }

});

/////////////////////////////////////////
/* Add content to user's to Library. */
/////////////////////////////////////////
router.get('/:id/add', mid.requiresLogin, function(req, res, next) {
  if(mediaType === 'books') {
    // Google Books
    var searchArray = bookself[0];
    details = searchArray.filter(function( obj ) {
      return obj.id == req.params.id;
    });

    // create object with form input
    var libraryData = {
      user: req.session.userId,
      itemTitle: details[0].title,
      itemAuthor: details[0].authors,
      itemGenre: details[0].categories,
      itemYear: details[0].publishedDate,
      itemDescription: details[0].description,
      itemImg: details[0].thumbnail,
      itemId: details[0].id,
      contentType: 'book'
    };

    // use schema's `create` method to insert document into Mongo
    Library.create(libraryData, function (error, user) {
      if (error) {
        return next(error);
      } else {
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
              itemId: details[0].id,
              related: relatedContent,
              added: true
            });
        }).catch(error => {
          console.log(error);
        });
      }
    });

  } else {
    // itunes
    var searchArray = bookself[0].results;
    details = searchArray.filter(function( obj ) {
      return obj.trackId == req.params.id;
    });

    // create object with form input
    var libraryData = {
      user: req.session.userId,
      itemTitle: details[0].trackName,
      itemAuthor: details[0].artistName,
      itemGenre: details[0].primaryGenreName,
      itemYear: details[0].releaseDate,
      itemDescription: details[0].longDescription,
      itemImg: details[0].artworkUrl100,
      itemRating: details[0].contentAdvisoryRating,
      itemId: details[0].trackId,
      contentType: 'movie'
    };

    // use schema's `create` method to insert document into Mongo
    Library.create(libraryData, function (error, user) {
      if (error) {
        return next(error);
      } else {
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
              itemId: details[0].trackId,
              related: relatedContent,
              added: true
            });
        }).catch(error => {
          console.log(error);
        });
      }
    });
  }
});

/////////////////////////////////////////
/* GET related Book searched. */
/////////////////////////////////////////
router.get('/:id/relatedBook', function(req, res, next) {
  bookself = [];

  // Google Books API
  books.search(req.params.id, {
    key: config.googleKey,
    type: 'books'
  }, function(error, results) {
      var googlePromise = new Promise((resolve, reject) => {
        resolve(bookself.push(results));
      });

       details = bookself[0];

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
             itemId: details[0].id,
             related: relatedContent,
             contentType: 'Book',
             added: false
           });
       }).catch(error => {
         console.log(error);
       });
  });

});


/////////////////////////////////////////
/* GET related Movie searched. */
/////////////////////////////////////////
router.get('/:id/relatedMovie', function(req, res, next) {
  bookself = [];
  // iTunes API
  axios.get('https://itunes.apple.com/search?', {
    params: {
      term: req.params.id,
      media: 'movie'
    }

  }).then(response => {
      bookself.push(response.data);

  }).then(response => {

     details = bookself[0].results

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
           itemId: details[0].trackId,
           related: relatedContent,
           contentType: 'Movie',
           added: false
         });
     }).catch(error => {
       console.log(error);
     });

  }).catch(error => {
    console.log(error);
  });

});

module.exports = router;
