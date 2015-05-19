var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var app = express();

var kinos = [
  {
    "Kino-ID" : 1,
    "Bezeichnung" : "Cinedom",
    "Straße" : "im MediaPark 1",
    "PLZ" : "50670 Köln",
    "Öffnungszeiten" : "Täglich von 10:30 - 23:30 Uhr",
    "Reservierungs-Hotline" : "0221 - 95195555",
    "Filmangebot" : [1,2,3],
    "Parkplätze" : "Ja",
    "Bewertung" : ""
  }
]

app.get('/', function(req, res){
  res.send('Welcome to Cinefox!');
});

app.get('/kinos', function(req, res){
  res.status(200).json(data);
});

app.post('/kinos', jsonParser, function(req, res){
  data.push(req.body);
  res.type('plain').send('Added!')
});

app.listen(1337);
