const express   = require('express');
const isAuth    = require('../helpers/isAuth');
const { check } = require('express-validator');
const router    = express.Router();
const { 
  getTweets,
  postTweets,
  getTweet,
  putTweet,
  deleteTweet
} = require('../controllers/tweets.js')

router.get('/', isAuth, getTweets)

router.post('/', 
[
  isAuth,
  check('title').isLength({ min: 4 }),
  check('desc').isLength({ min: 4 })
],
postTweets);

router.get('/:tweetId', isAuth ,getTweet);

router.put('/:tweetId', isAuth, putTweet);

router.delete('/:tweetId', isAuth, deleteTweet);

module.exports = router; 