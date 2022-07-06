var express = require('express');
var router = express.Router();
const movieModel = require('../models/movie.js');
const userModel = require('../models/users.js');
const passport = require('passport');
const localStrategy = require('passport-local');
const moment = require('moment');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/upload/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '.' + file.originalname);
  }
})

const upload = multer({ storage: storage })

passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function (req, res) {
  res.redirect('/movies');
});

router.get('/movies', ifLoggedIn, async function (req, res) {
  if (!req.query.page) {
    req.query.page = 1;
  }
  const skip = (req.query.page - 1) * 5;
  const movies = await movieModel.find().skip(skip).limit(5);
  res.render('index', { movies, user: req.session.passport });
});

router.get('/create/movie',ifLoggedIn, function (req, res) {
  res.render('createMovie',{ user: req.session.passport});
});

router.post('/create/movie', isLoggedIn, upload.single('image'), async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  if (!user) {
    res.redirect('/login');
  }
  const movie = await movieModel.create({
    title: req.body.title,
    image: req.file.filename,
    description: req.body.description,
    releaseDate: moment().format('MMMM Do YYYY'),
    author: user._id
  });
  user.movies.push(movie._id);
  await user.save();
  res.redirect('/movies');
});

router.get('/update/movie/:id', ifLoggedIn, async function (req, res) {
  const movie = await movieModel.findOne({ _id: req.params.id }).populate('author');
  res.render('updateMovie', { movie, user: req.session.passport });
});

router.post('/update/movie/:id', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate('movies');
  if (!user) {
    res.redirect('/login');
  }
  console.log(user);
  await movieModel.findOneAndUpdate({ _id: req.params.id }, req.body);
  res.redirect('/movies');
});

router.get('/delete/movie/:id', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  if (!user) {
    res.redirect('/login');
  }
  const movie = await movieModel.findOneAndDelete({ _id: req.params.id });
  fs.unlink(`./public/upload/${movie.image}`, (err) => {});
  res.redirect('/movies');
});

router.post('/register', function (req, res) {
  var newUser = new userModel({
    username: req.body.username,
    email: req.body.email
  })
  userModel.register(newUser, req.body.password)
    .then(function (u) {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/movies');
      })
    })
});

router.get('/login', function (req, res) {
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/movies',
  failureRedirect: '/login'
}), function (req, res, next) { });

router.get('/logout', (req, res, next)=> {
  req.session.destroy(function (err) {
    res.redirect('/movies');
  });

});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
function ifLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return next();

}

module.exports = router;