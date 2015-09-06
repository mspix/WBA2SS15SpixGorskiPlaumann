var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var ejs = require('ejs');
var redis = require('redis');
var fs = require('fs');
var http = require('http');
var faye = require('faye');

var db = redis.createClient();
var app = express();
var server = http.createServer(app);

// Adapter konfigurieren
var bayeux = new faye.NodeAdapter({
	mount: '/faye',
	// timeout: 10
});

// Adapter zum Server hinzufügen
bayeux.attach(server);

// Pub-Sub Client erzeugen
var client = new faye.Client('http://localhost:1338/faye');

// // Nachricht an Topic 'news' publishen
// var publication = client.publish('/news', {
	// 'autor': 'Bob',
	// 'vorschlag': 'Alice is back.',
// });
// publication.then(

	// // Promise-Handler wenn Publishen erfolgreich
	// function() {
		// res.writeHead(200, "OK");
		// res.write("Nachricht wurde gesendet.");
		// res.end();
	// },

	// // Promise-Handler wenn Publishen fehlgeschlagen
	// function (error) {
		// res.write("Nachricht wurde nicht gesendet.");
		// next(error);
	// }
// );

// Channel bzw. Topic "news" abonnieren
var subscription = client.subscribe('/news', function(message){
	console.log("Neue Nachricht von " + message.autor + " an " + message.empfaenger +": " + message.vorschlag);
});

// app.use(express.static(__dirname + '/public'));  	 // legt root-Ordner fest

app.set('view engine', 'ejs');

function queryBuilder(reqQueryArray){           	// Funktion bastelt ein Suchquery zusammen

		var queryString = "";						// resultierender QueryString

		if(reqQueryArray !== undefined){

			for(var prop in reqQueryArray){
				// var i = 0;
				if(queryString == ""){
					queryString += "?";
				}
				if(reqQueryArray[prop] == ""){
					continue;
				}
				if(prop == "submit"){
					break;
				}
				if(queryString != "?" && reqQueryArray[prop] != ""){
					queryString += "&";
				}
				queryString += prop + "=" + reqQueryArray[prop];

			}
		}
		console.log(queryString);
		return queryString;
}


app.get('/', function(req, res){
	res.render('pages/index');
});

app.get('/customer', function(req, res){
	res.render('pages/customer');
});

app.get('/proposalView', function(req, res){
	res.render('pages/proposalView');
});

app.get('/login', function(req, res){
	res.render('pages/loginCinema');
});

app.get('/cinemaoperator', function(req, res){
	res.render('pages/cinemaoperator');
});

app.get('/user', function(req, res){
	res.render('pages/user');
});


app.post('/users', jsonParser, function(req, res){
  var newUser = req.body;

  console.log(newUser);

  db.incr('id:users', function(err, rep){

    newUser.userID = rep;

    db.set('user:'+newUser.userID, JSON.stringify(newUser), function(err, rep){
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
      updatedUser.userID = Number(req.params.id); // Ohne Number() würde die ID zu einem String gewandelt werden
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

				// users = users.map(function(user){
					// return {id: user.id, name: user.name};
				// });

				res.json(users);

			});
		});

});

app.post('/vorschlaege', jsonParser, function(req, res){
  var newVorschlag = req.body;

  console.log(newVorschlag);

  db.incr('id:vorschlaege', function(err, rep){

    newVorschlag.vorschlagID = rep;

    db.set('vorschlag:'+newVorschlag.vorschlagID, JSON.stringify(newVorschlag), function(err, rep){
      res.json(newVorschlag);
	  db.bgsave();

    });
  });
});


app.get('/vorschlaege/:id', function(req, res){
  db.get('vorschlag:'+req.params.id, function(err, rep){

    if(rep){
      res.type('json').send(rep);
    }
    else{
      res.status(404).type('text').send('Der Vorschlag mit der ID '+req.params.id+' konnte nicht gefunden werden.');
    }

  });
});


app.put('/vorschlaege/:id', jsonParser, function(req, res){
  db.exists('vorschlag:'+req.params.id, function(err, rep){
    if (rep == 1){
      var updatedVorschlag = req.body;
      updatedVorschlag.userID = Number(req.params.id); // Ohne Number() würde die ID zu einem String gewandelt werden
      db.set('vorschlag:' + req.params.id, JSON.stringify(updatedVorschlag), function(err, rep){
        res.json(updatedVorschlag);
      });
    }
    else {
      res.status(404).type('text').send('Der Vorschlag mit der ID' + req.params.id +'konnte nicht gefunden werden.');
    }
  });
});


app.delete('/vorschlaege/:id', function(req, res){
  db.del('vorschlag:'+req.params.id, function(err, rep){
    if (rep == 1){
      res.status(200).type('text').send('OK - Vorschlag gelöscht');
    }
    else {
      res.status(404).type('text').send('Der Vorschlag mit der ID' + req.params.id +' konnte nicht gefunden werden.');
    }
  });
});

app.get('/vorschlaege', function(req, res){

		var vorschlaege = [];

		db.keys('vorschlag:*', function(err, rep){


			if(rep.length == 0){
			  res.json(vorschlaege);
			  return;
			}

			db.mget(rep, function(err, rep){

				rep.forEach(function(val){
					vorschlaege.push(JSON.parse(val));
				});

				// users = users.map(function(user){
					// return {id: user.id, name: user.name};
				// });

				res.json(vorschlaege);

			});
		});

});

app.get('/kinos', jsonParser, function(req, res){

	// fs.readFile('./views/partials/results.ejs', {encoding: 'utf-8'}, function(err, filestring){

		// if(err){
			// throw err;
		// }
		// else {

			// var path = "/kinos"+queryBuilder(req.query);

			// console.log(path);

			// var options = {
				// host: 'localhost',
				// port: 1337,
				// path: path,
				// method: 'GET',
				// headers: {
					// accept: 'application/json'
				// }
			// }

			// var externalRequest = http.request(options, function(externalResponse) {
				// console.log('Connected');
				// externalResponse.on('data', function(chunk) {

					// var userdata = JSON.parse(chunk);

					// var dataEdited = "{\"kinos\" : "+ JSON.stringify(userdata) + "}";
					// // console.log(dataEdited);
					// // console.log(userdata);

					// var html = ejs.render(filestring, JSON.parse(dataEdited));

					// res.setHeader('content-type', 'text/html');
					// res.writeHead(200);

					// res.write(dataEdited);

					// res.end();
				// });
			// });

			// externalRequest.end();
		// }

	// });

			var path = "/kinos"+queryBuilder(req.query);

			console.log(path);

			var options = {
				host: 'localhost',
				port: 1337,
				path: path,
				method: 'GET',
				headers: {
					accept: 'application/json'
				}
			}

			var externalRequest = http.request(options, function(externalResponse) {
				console.log('Connected');
				externalResponse.on('data', function(chunk) {

					var userdata = JSON.parse(chunk);

					// var dataEdited = "{\"kinos\" : "+ JSON.stringify(userdata) + "}";

					var dataEdited = JSON.stringify(userdata);



					res.setHeader('content-type', 'application/json');
					res.writeHead(200);

					 res.write(dataEdited);
					 console.log(dataEdited);
					res.end();
				});
			});

			externalRequest.end();

});


app.get('/filme', jsonParser, function(req, res){

			var path = "/filme"+queryBuilder(req.query);

			console.log(path);

			var options = {
				host: 'localhost',
				port: 1337,
				path: path,
				method: 'GET',
				headers: {
					accept: 'application/json'
				}
			}

			var externalRequest = http.request(options, function(externalResponse) {
				console.log('Connected');
				externalResponse.on('data', function(chunk) {

					var userdata = JSON.parse(chunk);

					var dataEdited = JSON.stringify(userdata);

					res.setHeader('content-type', 'application/json');
					res.writeHead(200);

					 res.write(dataEdited);
					 console.log(dataEdited);
					res.end();
				});
			});

			externalRequest.end();

});

app.post('/filme', jsonParser, function(req, res){
	// var formData = req.body;
	console.log(JSON.stringify(req.body)+'!!!');


	var options = {
		host: 'localhost',
		port: 1337,
		path: '/filme',
		method: 'POST',
		headers: {
        		'Content-Type': 'application/json'
    		}
	}

	var externalRequest = http.request(options, function(externalResponse){
		externalResponse.setEncoding('utf8');
   		externalResponse.on('data', function (chunk) {
       		console.log("body: " + chunk);

		var userdata = JSON.parse(chunk);

		var dataEdited = JSON.stringify(userdata);

		res.setHeader('content-type', 'application/json');
		res.writeHead(200);

		 res.write(dataEdited);
		 console.log(dataEdited);
		res.end();
   		});
	});

	externalRequest.write(JSON.stringify(req.body));
	externalRequest.end();
});

app.delete('/filme/:filmID', jsonParser, function(req, res){

});


app.get('/spielplaene', jsonParser, function(req, res){

			var path = "/spielplaene"+queryBuilder(req.query);

			console.log(path);

			var options = {
				host: 'localhost',
				port: 1337,
				path: path,
				method: 'GET',
				headers: {
					accept: 'application/json'
				}
			}

			var externalRequest = http.request(options, function(externalResponse) {
				console.log('Connected');
				externalResponse.on('data', function(chunk) {

					var userdata = JSON.parse(chunk);

					var dataEdited = JSON.stringify(userdata);

					res.setHeader('content-type', 'application/json');
					res.writeHead(200);

					 res.write(dataEdited);
					 console.log(dataEdited);
					res.end();
				});
			});

			externalRequest.end();

});

app.post('/spielplaene', jsonParser, function(req, res){

	console.log(JSON.stringify(req.body)+'!!!');


	var options = {
		host: 'localhost',
		port: 1337,
		path: '/spielplaene',
		method: 'POST',
		headers: {
        		'Content-Type': 'application/json'
    		}
	}

	var externalRequest = http.request(options, function(externalResponse){
		externalResponse.setEncoding('utf8');
   		externalResponse.on('data', function (chunk) {
       		console.log("body: " + chunk);

		var userdata = JSON.parse(chunk);

		var dataEdited = JSON.stringify(userdata);

		res.setHeader('content-type', 'application/json');
		res.writeHead(200);

		 res.write(dataEdited);
		 console.log(dataEdited);
		res.end();
   		});
	});
	externalRequest.write(JSON.stringify(req.body));
	externalRequest.end();

});

app.post('/newChannel', jsonParser, function(req, res){
	var newsPublication = client.publish('/'+req.body.channel.toLowerCase(), {
		'author': req.body.author,
		'channel': req.body.channel
	});
	newsPublication.then(

		// Promise-Handler wenn Publishen erfolgreich
		function() {
			res.writeHead(200, "OK");
			res.write("Nachricht wurde gesendet.");
			res.end();
		},

		// Promise-Handler wenn Publishen fehlgeschlagen
		function (error) {
			console.log(error);
			res.write("Nachricht wurde nicht gesendet.");
			next(error);
		}
	);
});

server.listen(1338, function(){
	console.log("Dienstnutzer/Server listens on Port 1338");
});
// app.listen(1338, function(){
	// console.log("Dienstnutzer listens on Port 1338");
// });
