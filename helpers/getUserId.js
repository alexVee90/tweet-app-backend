const jwt    = require('jsonwebtoken');
const config = require('config');

module.exports = (token) => { 

  const decoded = jwt.verify(token, config.get('secret'));
  return decoded.id;
}