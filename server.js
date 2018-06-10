var express = require('express');
var bodyParser = require('body-parser');
var Pusher = require('pusher');
require('dotenv').config()

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// enable cross-origin resource sharing
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var pusher = new Pusher({ // connect to pusher
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
});

app.get('/', function (req, res) { // to test if the server is running
  res.send('all green');
});

app.post('/save-text', function (req, res) {
  if (req.body.text && req.body.text.trim() !== '') {
    pusher.trigger('editor', 'text-update', { text: req.body.text });
    res.status(200).send({ success: true, message: 'text broadcasted' })
  } else {
    res.status(400).send({ success: false, message: 'text not broadcasted' })
  }
})

app.post('/editor-text', function (req, res) {
  if (req.body.text) {
    pusher.trigger('editor', 'editor-update', { text: req.body.text, selection: req.body.selection });
    res.status(200).send({ success: true, message: 'editor update broadcasted' })
  } else {
    res.status(400).send({ success: false, message: 'editor update not broadcasted' })
  }
})

var port = process.env.PORT || 5000;
console.log(`server running on port ${port}`)
app.listen(port);
