var express = require('express');
var bodyParser = require('body-parser');
var redis = require('redis');

var db = redis.createClient();
var app = express();
app.use(bodyParser.json());

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
];

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


app.post('/users', function(req, res){
  var newUser = req.body;

  db.incr('id:users', function(err, rep){

    newUser.id = rep;

    db.set('user:'+newUser.id, JSON.stringify(newUser), function(err, rep){
      res.json(newUser);
    db.bgsave();

    });
  });
});


app.get('/users/:id', function(req, res){
  db.get('user:'+req.params.id, function(err, rep){

    if(rep){
      res.type('json').send(rep);
    }
    else{
      res.status(404).type('text').send('Der User mit der ID '+req.params.id+' konnte nicht gefunden werden.');
    }

  });
});


app.put('/users/:id', function(req, res){
  db.exists('user:'+req.params.id, function(err, rep){
    if (rep == 1){
      var updatedUser = req.body;
      updatedUser.id = req.params.id;
      db.set('user:' + req.params.id, JSON.stringify(updatedUser), function(err, rep){
        res.json(updatedUser);
      });
    }
    else {
      res.status(404).type('text').send('Der User mit der ID' + req.params.id +'konnte nicht gefunden werden.');
    }
  });
});


app.delete('/users/:id', function(req, res){
  db.del('user:'+req.params.id, function(err, rep){
    if (rep == 1){
      res.status(200).type('text').send('OK - User gelöscht');
    }
    else {
      res.status(404).type('text').send('Der User mit der ID' + req.params.id +' konnte nicht gefunden werden.');
    }
  });
});


app.get('/users', function(req, res){
  db.keys('user:*', function(err, rep){

    var users = [];

    if(rep.length == 0){
      res.json(users);
      return;
    }

    db.mget(rep, function(err, rep){

      rep.forEach(function(val){
        users.push(JSON.parse(val));
      });

      users = users.map(function(user){
        return {id: user.id, name: user.name};
      });

      res.json(users);

    });
  });
});




app.get('/', function(req, res){
  res.send('Welcome to Cinefox!');
});

app.get('/kinos', function(req, res){
  res.status(200).json(data);
});

app.post('/kinos', function(req, res){
  data.push(req.body);
  res.type('plain').send('Added!')
});

app.get('/filme', function(req, res){
  res.status(200).json(filme);

});

app.post('/filme', function(req, res){
    filme.push(req.body);
    res.type('plain').send('Film Added!')

});

app.listen(1337);
