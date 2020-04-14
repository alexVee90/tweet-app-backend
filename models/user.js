const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: { 
    type: String,
    required: true
  },
  tweets: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet'
  },
  resetToken: String
})

const User = mongoose.model('User', UserSchema);
module.exports = User;