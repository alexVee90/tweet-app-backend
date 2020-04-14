const { validationResult } = require('express-validator');
const setErr               = require('../helpers/setErr');
const bcrypt               = require('bcryptjs');
const { User }             = require('../models');
const jwt                  = require('jsonwebtoken');
const config               = require('config');
const { transporter }      = require('../helpers/nodemailerConfig');
const fs                   = require('fs');
const path                 = require('path');
const getDirname           = require('../helpers/getDirname');
const getUserId            = require('../helpers/getUserId');

exports.getUser = async (req, res, next) => { 
  const userId = req.userId; 

  try {
    const user = await User.findById(userId).select('-password');
    if(!user) setErr(400, 'User does not exist in the Db')

    res.status(200).json({ msg: 'success', data: user })
  } catch (error) {
    next(error);
  }
}

exports.postLogin = async (req, res, next) => { 
  const errors = validationResult(req);
  if(!errors.isEmpty()) setErr(401, 'Email or password not valid', false, next);

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if(!user) setErr(400, 'Email does not exist in the database');

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) setErr(400, 'Password is not correct');
    
    const token = await jwt.sign({id: user._id}, config.get('secret'));

    res.status(200).json({msg: 'success', data: {email: user.email, id: user._id, tweets: user.tweets || [], token}});
  } catch (error) {
    next(error)
  }  
}

exports.postRegister = async (req, res, next) => { 
  const errors = validationResult(req);
  if(!errors.isEmpty()) setErr(401, 'Email or password not valid', false, next);

  const { email, password } = req.body;

  try {
    const returnedUser = await User.findOne({ email }); 
    if(returnedUser) setErr(400, 'Email address is already in use');

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User ({ email, password: hashedPassword });

    const token = await jwt.sign({id: user._id}, config.get('secret'));

    const file = fs.createReadStream(path.join(getDirname(), 'views', 'welcome-email.html'));

    transporter.sendMail({
      to: email,
      from: 'noreply@alex.com',
      subject: 'Welcome to TweetDotCom',
      html: file
    })

    await user.save();
    res.status(200).json({msg: 'success', data: {email: user.email, id: user._id, tweets: user.tweets || [], token}});
  } catch (error) {
    next(error)
  }
}

exports.postRecover = async (req, res, next) => { 
  const { email } = req.body;

  try {
    const returnedUser = await User.findOne({ email });
    if(!returnedUser) setErr(400, 'User does not exit in the db');

    const resetToken = jwt.sign({ id: returnedUser._id}, config.get('secret'));
    returnedUser.resetToken = resetToken;
    await returnedUser.save(); 
    const file = fs.createReadStream(path.join(getDirname(), 'views', 'reset-email.html'));
    transporter.sendMail({
      to: email,
      from: 'noreply@alex.com',
      subject: 'Reset-Password',
      html: file
    })
    res.json({ msg: 'success', data: resetToken});
  } catch (error) {
    next(error);
  }
}

exports.postReset = async (req, res, next) => { 
  const { recoverToken, password } = req.body;
  const userId = getUserId(recoverToken);

  try {
    const user = await User.findById(userId);
    if(!user) setErr(400, 'User not found');

    if(user.resetToken != recoverToken) setErr(400, 'Token is not correct');
    
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = '';
    await user.save();

    const token = await jwt.sign({id: user._id}, config.get('secret'));

    res.status(200).json({msg: 'success', data: {email: user.email, id: user._id, tweets: user.tweets || [], token}});
  } catch(err) { 
    next(err);
  }
}