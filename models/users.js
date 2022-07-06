const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/trending');

const plm = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  movies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'movie'
  }]
});

userSchema.plugin(plm);

module.exports = mongoose.model('users', userSchema);