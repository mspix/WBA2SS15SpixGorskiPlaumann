var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var app = express();



var filme = [
              {
                  "id"                  :     "1",
                  "Titel"               :     "",
                  "Erscheinungstermin"  :     "",
                  "Genre"               :     "",
                  "Regie"               :     "",
                  "Bewertung"           :     "",
                  "Thumbnail"           :     "",
                  "Filmbeschreibung"    :     "",
                  "Dauer"               :     ""
              }
          ];




app.post('/filme', jsonParser, function(req, res){
    filme.push(req.body);
    res.type('plain').send('Film Added!')

});

app.get('/filme', function(req, res){
  res.status(200).json(filme);

});

app.listen(1337);
