var express = require('express');
var bodyParser = require('body-parser');
var redis = require('redis');

var db = redis.createClient();
var app = express();

app.use(bodyParser.json());

// Log mit Pfad und Zeitangabe
app.use(function (req, res, next) {
	console.log('Time: %d ' + ' Request-Pfad: ' + req.path, Date.now());
	next();
});

function queryFilter(dbArray, queryArray){

	if(queryArray !== undefined){
			
			var counter = 0;
			for (prop in queryArray) {
				counter++;
			}
		
			var queryResult = [];
							
				dbArray.forEach(function(dbElement) {
					var propCounter = 0;
					for (var queryProp in queryArray) {

						for (var dbElementProp in dbElement) {
							// Checking if Array in Array
							if(queryProp == dbElementProp && Array.isArray(queryArray[queryProp]) && Array.isArray(dbElement[dbElementProp])){
								for (var i=0; i < dbElement[dbElementProp].length; i++){
								
									if( queryArray[queryProp][0] == dbElement[dbElementProp][i]){
										propCounter++;
										break;
									}
								}
							continue;
							}
							
							if( dbElement[dbElementProp] == queryArray[queryProp] ){
								propCounter++;
							}
					
						}
					}
					if( propCounter == counter ){
						queryResult.push(dbElement);
					}
				});
	
			return queryResult;	
	}
	else {
		return dbArray;
	}
}




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
      updatedUser.id = Number(req.params.id); // Ohne Number() würde die ID zu einem String gewandelt werden
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

		var users = [];

		db.keys('user:*', function(err, rep){


			if(rep.length == 0){
			  res.json(users);
			  return;
			}
			
			db.mget(rep, function(err, rep){

				rep.forEach(function(val){
					users.push(JSON.parse(val));
				});
			
				res.json(queryFilter(users, req.query));
			
			});
		});
		

});


app.get('/', function(req, res){
  res.send('Welcome to Cinefox!');
});

app.post('/kinos', function(req, res){
  var newKino = req.body;

  db.incr('kinoID:kinos', function(err, rep){

    newKino.kinoID = rep;

    db.set('kino:'+newKino.kinoID, JSON.stringify(newKino), function(err, rep){
      res.json(newKino);
    db.bgsave();

    });
  });
});


app.get('/kinos/:kinoID', function(req, res){
  db.get('kino:'+req.params.kinoID, function(err, rep){

    if(rep){
      res.type('json').send(rep);
    }
    else{
      res.status(404).type('text').send('Das Kino mit der ID '+req.params.kinoID+' konnte nicht gefunden werden.');
    }

  });
});


app.put('/kinos/:kinoID', function(req, res){
  db.exists('kino:'+req.params.kinoID, function(err, rep){
    if (rep == 1){
      var updatedKino = req.body;
      updatedKino.kinoID = Number(req.params.kinoID); // Ohne Number() würde die ID zu einem String gewandelt werden
      db.set('kino:' + req.params.kinoID, JSON.stringify(updatedKino), function(err, rep){
        res.json(updatedKino);
      });
    }
    else {
      res.status(404).type('text').send('Das Kino mit der ID' + req.params.kinoID +'konnte nicht gefunden werden.');
    }
  });
});


app.delete('/kinos/:kinoID', function(req, res){
  db.del('kino:'+req.params.kinoID, function(err, rep){
    if (rep == 1){
      res.status(200).type('text').send('OK - Kino gelöscht');
    }
    else {
      res.status(404).type('text').send('Das Kino mit der ID' + req.params.kinoID +' konnte nicht gefunden werden.');
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
		
		res.json(queryFilter(kinos, req.query));
		
    });
  });
});


app.post('/filme', function(req, res){
  var newFilm = req.body;

  db.incr('filmID:filme', function(err, rep){

    newFilm.filmID = rep;


    db.set('film:'+newFilm.filmID, JSON.stringify(newFilm), function(err, rep){
      res.json(newFilm);
    db.bgsave();

    });
  });
});


app.get('/filme/:filmID', function(req, res){
  db.get('film:'+req.params.filmID, function(err, rep){

    if(rep){
      res.type('json').send(rep);
    }
    else{
      res.status(404).type('text').send('Der Film mit der ID '+req.params.filmID+' konnte nicht gefunden werden.');
    }

  });
});


app.put('/filme/:filmID', function(req, res){
  db.exists('film:'+req.params.filmID, function(err, rep){
    if (rep == 1){
      var updatedFilm = req.body;
      updatedFilm.filmID = Number(req.params.filmID);
      db.set('film:' + req.params.filmID, JSON.stringify(updatedFilm), function(err, rep){
        res.json(updatedFilm);
      });
    }
    else {
      res.status(404).type('text').send('Der Film mit der ID' + req.params.filmID +'konnte nicht gefunden werden.');
    }
  });
});


app.delete('/filme/:filmID', function(req, res){
  db.del('film:'+req.params.filmID, function(err, rep){
    if (rep == 1){
      res.status(200).type('text').send('OK - Film gelöscht');
    }
    else {
      res.status(404).type('text').send('Der Film mit der ID' + req.params.filmID +' konnte nicht gefunden werden.');
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

	  	res.json(queryFilter(filme, req.query));
    
	});
  });
});


app.post('/spielplaene', function(req, res){
  var newSpielplan = req.body;

  db.incr('spielplanID:spielplaene', function(err, rep){

    newSpielplan.spielplanID = rep;

    db.set('spielplan:'+newSpielplan.spielplanID, JSON.stringify(newSpielplan), function(err, rep){
      res.json(newSpielplan);
    db.bgsave();

    });
  });
});


app.get('/spielplaene/:spielplanID', function(req, res){
  db.get('spielplan:'+req.params.spielplanID, function(err, rep){

    if(rep){
      res.type('json').send(rep);
    }
    else{
      res.status(404).type('text').send('Der Spielplan mit der ID '+req.params.spielplanID+' konnte nicht gefunden werden.');
    }

  });
});


app.put('/spielplaene/:spielplanID', function(req, res){
  db.exists('spielplan:'+req.params.spielplanID, function(err, rep){
    if (rep == 1){
      var updatedSpielplan = req.body;
      updatedSpielplan.spielplanID = Number(req.params.spielplanID);
      db.set('spielplan:' + req.params.spielplanID, JSON.stringify(updatedSpielplan), function(err, rep){
        res.json(updatedSpielplan);
      });
    }
    else {
      res.status(404).type('text').send('Der Spielplan mit der ID' + req.params.spielplanID +'konnte nicht gefunden werden.');
    }
  });
});


app.delete('/spielplaene/:spielplanID', function(req, res){
  db.del('spielplan:'+req.params.spielplanID, function(err, rep){
    if (rep == 1){
      res.status(200).type('text').send('OK - Spielplan gelöscht');
    }
    else {
      res.status(404).type('text').send('Der Spielplan mit der ID' + req.params.spielplanID +' konnte nicht gefunden werden.');
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
        spielplaene.push(JSON.parse(val));
      });

	  	res.json(queryFilter(spielplaene, req.query));
    });
  });
});


app.listen(1337);
