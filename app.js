var express = require('express')
var livematch = require('./routes/livematch')
var app = express()

app.get("/", function (req, res) {
  res.send('Hello World')
})

app.use('/livematch', livematch)

app.listen(3000, function () {
  console.log('Example app listening on port 3000.')
})