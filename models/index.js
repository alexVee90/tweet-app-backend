const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://alex:alex@cluster0-kpg8o.mongodb.net/test?retryWrites=true&w=majority',  
{ useNewUrlParser: true, useUnifiedTopology: true },
() => { 
  console.log('DB connected');
});

module.exports.Tweet = require('./tweet');
module.exports.User = require('./user');