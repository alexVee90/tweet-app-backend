const mongoose = require('mongoose');

const TweetSchema = new mongoose.Schema({ 
  title: { 
    type: String, 
    required: true
  }, 
  imageUrl: { 
    type: String
  }, 
  imagePath: { 
    type: String,
    required: true
  },
  desc: { 
    type: String,
    required: true
  }, 
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true })

const Tweet = mongoose.model('Tweet', TweetSchema);
module.exports = Tweet;