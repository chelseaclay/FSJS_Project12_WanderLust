var mongoose = require('mongoose');

var LibrarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  itemTitle: String,
  itemAuthor: String,
  itemGenre: String,
  itemYear: Date,
  itemDescription: String,
  itemImg: String,
  itemRating: String,
  contentType: String
});

var Library = mongoose.model('Library', LibrarySchema);
module.exports = Library;
