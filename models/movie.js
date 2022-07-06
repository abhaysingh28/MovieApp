const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: String,
  rating: Number,
  votes: Number,
  description: String,
  releaseDate: String,
  image: {
    type: String,
    default: 'https://tokyoarkade.com/wp-content/uploads/2020/08/Modelo.svg'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }
});

module.exports = mongoose.model('movie', movieSchema);