const multer = require('multer');
const { v4 } = require('uuid');
const path   = require('path');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join('public', 'images'))
  },
  filename: function (req, file, cb) {
    cb(null, `${v4()}${file.originalname}`)
  }
})

const fileFilter = (req, file, cb) => { 
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') { 
    cb(null, true)
  } else { 
    cb(null, false);
  }
}

module.exports.upload = multer({ storage, fileFilter });