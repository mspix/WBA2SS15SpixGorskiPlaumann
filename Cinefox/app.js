var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var app = express();

var data = [
  {"title" : "Hello World!"},
  {"description" : "This is a test."}
]

var filme = [];

app.get('/', function(req, res){
  res.send('Hello World!');
});

app.get('/data', function(req, res){
  res.status(200).json(data);
});

app.post('/data', jsonParser, function(req, res){
  data.push(req.body);
  res.type('plain').send('Added!')
});

app.post('/filme', jsonParser, function(req, res){
    filme.push(req.body);
    res.type('plain').send('Film Added!')

});

app.get('/filme', function(req, res){
  res.status(200).json(filme);


app.listen(1337);
