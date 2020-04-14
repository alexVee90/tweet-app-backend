const express   = require('express');
const router    = express.Router();
const { check } = require('express-validator');
const {
  postLogin,
  postRegister,
  postRecover,
  postReset,
  getUser
} = require('../controllers/auth');
const isAuth = require('../helpers/isAuth');

router.get('/', isAuth, getUser);

router.post('/login', [
  check('email').trim().isEmail(),
  check('password').trim().isLength({ min: 4})
],postLogin);

router.post('/register', [
  check('email').trim().isEmail(),
  check('password').trim().isLength({ min: 4})
], postRegister);

router.post('/recover', postRecover);

router.post('/reset', postReset);

module.exports = router;
