const jwt    = require('jsonwebtoken');
const config = require('config');
const setErr = require('./setErr');

module.exports = async (req, res, next) => { 
  const token = req.header('x-auth-token');
  if(!token) setErr(400, 'No token Present', false, next);

  try {
    const decoded = jwt.verify(token, config.get('secret'));
    req.userId = decoded.id;
    next();
  } catch (error) {
    next(error);
  }
}