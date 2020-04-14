const express      = require('express');
const cors         = require('cors');
const bodyParser   = require('body-parser');
const path         = require('path');
const tweetsRoutes = require('./routes/tweets');
const { upload }   = require('./helpers/multerConfig');
const authRoutes   = require('./routes/auth');

const app    = express();
const server = require('http').Server(app);
const PORT   = process.env.PORT || 5000;
const io     = require('./helpers/socket').init(server);

app.use(cors());
app.use(upload.single('image'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use('/public/images', express.static(path.join(__dirname, 'public', 'images')));

app.get('/', (req, res, next) => { 
  res.json('home route');
})

app.use('/tweets', tweetsRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => { 
  if(!error.status) {
    error.status = 500; 
    error.msg = 'failure';
    error.reason = 'Internal server error'
  }
  console.log(`controledError: ${error} / Message: ${error.msg} / Reason: ${error.reason}`);
  res.json(error);
}) 

server.listen(PORT, () => { 
  console.log(`server running on port ${PORT}`)
})