var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var redis = require('redis');

var db = redis.createClient();
var app = express();

// app.use(bodyParser.json());
// app.use(bodyParser());


// var kinos = [
//   {
//     "Kino-ID" : 1,
//     "Bezeichnung" : "Cinedom",
//     "Straße" : "im MediaPark 1",
//     "PLZ" : "50670 Köln",
//     "Öffnungszeiten" : "Täglich von 10:30 - 23:30 Uhr",
//     "Reservierungs-Hotline" : "0221 - 95195555",
//     "Filmangebot" : [1,2,3],
//     "Parkplätze" : "Ja",
//     "Bewertung" : ""
//   }
// ];
//
// var filme = [
//               {
//                   "id"                  :     "1",
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


app.post('/users', jsonParser, function(req, res){
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


app.put('/users/:id', jsonParser, function(req, res){
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

app.post('/filme', function(req, res){
    filme.push(req.body);
    res.type('plain').send('Film Added!')

});


// A browser's default method is 'GET', so this
// is the route that express uses when we visit
// our site initially.
app.get('/filmForm', function(req, res){
  // The form's action is '/' and its method is 'POST',
  // so the `app.post('/', ...` route will receive the
  // result of our form
  var html =  '<h1>Filmformular</h1><br>' +
              '<form action="/filmForm" method="post">' +
                 'Titel: ' +
                 '<input type="text" name="title" />' +
                 '<br>' +
                 'Erscheinungstermin: ' +
                 '<input type="text" name="relDate" />' +
                 '<br>' +
                 'Genre: ' +
                 '<input type="text" name="genre" />' +
                 '<br>' +
                 'Regie: ' +
                 '<input type="text" name="regie" />' +
                 '<br>' +
                 'Bewertung: ' +
                 '<input type="text" name="evaluation" />' +
                 '<br>' +
                 'Thumbnail: ' +
                 '<input type="text" name="thumbnail" />' +
                 '<br>' +
                 'Beschreibung: ' +
                 '<input type="text" name="description" />' +
                 '<br>' +
                 'Dauer: ' +
                 '<input type="text" name="length" />' +
                 '<br>' +
                 '<button type="submit">Submit</button>' +
              '</form>';



  res.send(html);
});


app.post('/filmForm', bodyParser(), function(req, res){

  // var newFilm = {
  //                   "titel"               :     "req.body.title"
  //               };



  // var newFilm = '{
  //                   "titel"               :     "' + req.body.title +         '",
  //                   "Erscheinungstermin"  :     "' + req.body.relDate +       '",
  //                   "Genre"               :     "' + req.body.genre +         '",
  //                   "Regie"               :     "' + req.body.regie +         '",
  //                   "Bewertung"           :     "' + req.body.evaluation +    '",
  //                   "Thumbnail"           :     "' + req.body.thumbnail +     '",
  //                   "Beschreibung"        :     "' + req.body.description +   '",
  //                   "Dauer"               :     "' + req.body.length +        '"
  //               }';

  db.incr('id:filme', function(err, rep){

      // var newFilm = "{
      //                   \"Titel\"               :     \"" + req.body.title +         "\",
      //                   \"Erscheinungstermin\"  :     \"" + req.body.relDate +       "\",
      //                   \"Genre\"               :     \"" + req.body.genre +         "\",
      //                   \"Regie\"               :     \"" + req.body.regie +         "\",
      //                   \"Bewertung\"           :     \"" + req.body.evaluation +    "\",
      //                   \"Thumbnail\"           :     \"" + req.body.thumbnail +     "\",
      //                   \"Beschreibung\"        :     \"" + req.body.description +   "\",
      //                   \"Dauer\"               :     \"" + req.body.length +        "\"
      //               }";
      var newFilm = {
                        "titel"               :     req.body.title,
                        "erscheinungstermin"  :     req.body.relDate,
                        "genre"               :     req.body.genre,
                        "regie"               :     req.body.regie,
                        "bewertung"           :     req.body.evaluation,
                        "thumbnail"           :     req.body.thumbnail,
                        "beschreibung"        :     req.body.description,
                        "dauer"               :     req.body.length
                    };

                    newFilm.id = rep;

    db.set('film:'+newFilm.id, JSON.stringify(newFilm), function(err, rep){
      res.json(newFilm);
    db.bgsave();

    });

  // var confirmationParsed = JSON.parse(newFilm);
  });

  res.send('Added!');
});

app.listen(1337);
