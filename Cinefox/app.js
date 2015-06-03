var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var redis = require('redis');

var db = redis.createClient();
var app = express();

app.use(bodyParser.json());

// var kinos = [
//   {
//     "Bezeichnung" : "Cinedom",
//     "Straße" : "im MediaPark 1",
//     "PLZ" : "50670 Köln",
//     "Öffnungszeiten" : "Täglich von 10:30 - 23:30 Uhr",
//     "Reservierungs-Hotline" : "0221 - 95195555",
//     "Filmangebot" : [1,2,3],
//     "Preise" : "",
//     "Parkplätze" : "Ja",
//     "Bewertung" : ""
//   }
// ];
//
// var filme = [
//               {
//                   "Titel"               :     "",
//                   "Erscheinungstermin"  :     "",
//                   "Genre"               :     "",
//                   "Regie"               :     "",
//                   "Bewertung"           :     "",
//                   "Thumbnail"           :     "",
//                   "Filmbeschreibung"    :     "",
//                   "Dauer"               :     ""
//               }
//           ];


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

app.post('/kinos', function(req, res){
  var newKino = req.body;

  db.incr('id:kinos', function(err, rep){

    newKino.id = rep;

    db.set('kino:'+newKino.id, JSON.stringify(newKino), function(err, rep){
      res.json(newKino);
    db.bgsave();

    });
  });
});


app.get('/kinos/:id', function(req, res){
  db.get('kino:'+req.params.id, function(err, rep){

    if(rep){
      res.type('json').send(rep);
    }
    else{
      res.status(404).type('text').send('Das Kino mit der ID '+req.params.id+' konnte nicht gefunden werden.');
    }

  });
});


app.put('/kinos/:id', function(req, res){
  db.exists('kino:'+req.params.id, function(err, rep){
    if (rep == 1){
      var updatedKino = req.body;
      updatedKino.id = req.params.id;
      db.set('kino:' + req.params.id, JSON.stringify(updatedKino), function(err, rep){
        res.json(updatedKino);
      });
    }
    else {
      res.status(404).type('text').send('Das Kino mit der ID' + req.params.id +'konnte nicht gefunden werden.');
    }
  });
});


app.delete('/kinos/:id', function(req, res){
  db.del('kino:'+req.params.id, function(err, rep){
    if (rep == 1){
      res.status(200).type('text').send('OK - Kino gelöscht');
    }
    else {
      res.status(404).type('text').send('Das Kino mit der ID' + req.params.id +' konnte nicht gefunden werden.');
    }
  });
});


app.get('/kinos', function(req, res){
  db.keys('kino:*', function(err, rep){

    var kinos = [];

    if(rep.length == 0){
      res.json(kinos);
      return;
    }

    db.mget(rep, function(err, rep){

      rep.forEach(function(val){
        kinos.push(JSON.parse(val));
      });

      kinos = kinos.map(function(kino){
        return {id: kino.id, name: kino.name};
      });

      res.json(kinos);

    });
  });
});


app.post('/filme', function(req, res){
  var newFilm = req.body;

  db.incr('id:filme', function(err, rep){

    newFilm.id = rep;

    db.set('film:'+newFilm.id, JSON.stringify(newFilm), function(err, rep){
      res.json(newFilm);
    db.bgsave();

    });
  });
});


app.get('/filme/:id', function(req, res){
  db.get('film:'+req.params.id, function(err, rep){

    if(rep){
      res.type('json').send(rep);
    }
    else{
      res.status(404).type('text').send('Der Film mit der ID '+req.params.id+' konnte nicht gefunden werden.');
    }

  });
});


app.put('/filme/:id', function(req, res){
  db.exists('film:'+req.params.id, function(err, rep){
    if (rep == 1){
      var updatedFilm = req.body;
      updatedFilm.id = req.params.id;
      db.set('film:' + req.params.id, JSON.stringify(updatedFilm), function(err, rep){
        res.json(updatedFilm);
      });
    }
    else {
      res.status(404).type('text').send('Der Film mit der ID' + req.params.id +'konnte nicht gefunden werden.');
    }
  });
});


app.delete('/filme/:id', function(req, res){
  db.del('film:'+req.params.id, function(err, rep){
    if (rep == 1){
      res.status(200).type('text').send('OK - Film gelöscht');
    }
    else {
      res.status(404).type('text').send('Der Film mit der ID' + req.params.id +' konnte nicht gefunden werden.');
    }
  });
});


app.get('/filme', function(req, res){
  db.keys('film:*', function(err, rep){

    var filme = [];

    if(rep.length == 0){
      res.json(filme);
      return;
    }

    db.mget(rep, function(err, rep){

      rep.forEach(function(val){
        filme.push(JSON.parse(val));
      });

      filme = filme.map(function(film){
        return {id: film.id, titel: film.titel};
      });

      res.json(filme);

    });
  });
});


app.post('/spielplaene', function(req, res){
  var newSpielplan = req.body;

  db.incr('id:spielplaene', function(err, rep){

    newSpielplan.id = rep;

    db.set('spielplan:'+newSpielplan.id, JSON.stringify(newSpielplan), function(err, rep){
      res.json(newSpielplan);
    db.bgsave();

    });
  });
});


app.get('/spielplaene/:id', function(req, res){
  db.get('spielplan:'+req.params.id, function(err, rep){

    if(rep){
      res.type('json').send(rep);
    }
    else{
      res.status(404).type('text').send('Der Spielplan mit der ID '+req.params.id+' konnte nicht gefunden werden.');
    }

  });
});


app.put('/spielplaene/:id', function(req, res){
  db.exists('spielplan:'+req.params.id, function(err, rep){
    if (rep == 1){
      var updatedSpielplan = req.body;
      updatedSpielplan.id = req.params.id;
      db.set('spielplan:' + req.params.id, JSON.stringify(updatedSpielplan), function(err, rep){
        res.json(updatedSpielplan);
      });
    }
    else {
      res.status(404).type('text').send('Der Spielplan mit der ID' + req.params.id +'konnte nicht gefunden werden.');
    }
  });
});


app.delete('/spielplaene/:id', function(req, res){
  db.del('spielplan:'+req.params.id, function(err, rep){
    if (rep == 1){
      res.status(200).type('text').send('OK - Spielplan gelöscht');
    }
    else {
      res.status(404).type('text').send('Der Spielplan mit der ID' + req.params.id +' konnte nicht gefunden werden.');
    }
  });
});


app.get('/spielplaene', function(req, res){
  db.keys('spielplan:*', function(err, rep){

    var spielplaene = [];

    if(rep.length == 0){
      res.json(spielplaene);
      return;
    }

    db.mget(rep, function(err, rep){

      rep.forEach(function(val){
        filme.push(JSON.parse(val));
      });

      filme = filme.map(function(spielplan){
        return {id: spielplan.id, titel: spielplan.titel};
      });

      res.json(spielplaene);

    });
  });
});


app.listen(1337);
