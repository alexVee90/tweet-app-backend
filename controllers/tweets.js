const { Tweet }            = require('../models/index');
const setErr               = require('../helpers/setErr');
const { validationResult } = require('express-validator');
const fs                   = require('fs');
const { promisify }        = require('util');
const path                 = require('path');
const getDirname           = require('../helpers/getDirname');
const io                   = require('../helpers/socket');
const unlink = promisify(fs.unlink);

exports.getTweets =  async (req, res, next) => {
  try {
    const tweets = await Tweet.find({});
    res.status(200).json({msg: 'success', data: tweets})
  } catch (error) {
    next(error)
  }
}

exports.postTweets = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) setErr(422, 'invalid input. Title and Desc are required', false, next)
  if(req.body.image) setErr(422, 'File not uploaded', false, next)

  const { title, desc } = req.body;
  const postedBy = req.userId;

  const url = `http://localhost:5000/${req.file.path}`;
  const imageUrl = url.replace(/\\/g, "/");
  const imagePath = req.file.path;
  const tweet = new Tweet({ title, imageUrl, imagePath, desc, postedBy })

  try {
    await tweet.save();

    io.getIO().emit('tweets', { action: `creation`, user: `${req.userId}`, data: tweet });

    res.status(201).json({msg: 'success', data: tweet})
  } catch (error) {
    next(error);
  }
}

exports.getTweet = async (req, res, next) => {
  const tweetId = req.params.tweetId; 

  try {
    const tweet = await Tweet.findById(tweetId);
    if(!tweet) setErr(401, 'bad request');

    res.status(200).json({msg: 'success', data: tweet});

  } catch (error) {
    next(error)
  }
}

exports.putTweet = async (req, res, next) => {

  const tweetId = req.params.tweetId; 
  const { title, desc } = req.body;
  const postedBy = req.userId;

  let imageUrl = '';
  let imagePath = ''; 

  if(req.file) {
    imagePath = req.file.path;
    imageUrl = `http://localhost:5000/${imagePath.replace(/\\/g, "/")}`;
  }

  try {
    const tweet = await Tweet.findById(tweetId);
    if(!tweet) setErr(422, 'bad request');

    if(tweet.postedBy != postedBy) {
      await unlink(path.join(getDirname(), imagePath));
      setErr(400, 'You are not authorized to edit this resource');
    }

    io.getIO().emit('tweets', { action: `update`, user: `${req.userId}`, data: tweet })

    if(req.file) {
      await unlink(path.join(getDirname(), tweet.imagePath));
    }
 
    tweet.title = title;
    tweet.imageUrl = imageUrl || tweet.imageUrl;
    tweet.imagePath = imagePath || tweet.imagePath;
    tweet.desc = desc;
    tweet.postedBy = postedBy;

    await tweet.save();
    res.status(201).json({msg: 'success', data: tweet});
  } catch (error) {
    next(error);
  }
}

exports.deleteTweet = async (req, res, next) => {
  const userId = req.userId;
  const { tweetId } = req.params;
  try {
    const tweet = await Tweet.findById(tweetId);

    if(tweet.postedBy != userId) setErr(400, 'You are not authorized to edit this resource');

    await unlink(path.join(getDirname(), tweet.imagePath));
    await Tweet.findByIdAndRemove(tweetId);

    io.getIO().emit('tweets', { action: `delete`, user: `${req.userId}`, data: tweet })

    res.status(200).json({msg: 'success', data: null });
  } catch (error) {
    next(error);
  }
}