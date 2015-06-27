var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var ejs = require('ejs');
var redis = require('redis');
var fs = require('fs');
var http = require('http');

var db = redis.createClient();
var app = express();



app.get('/test', jsonParser, function(req, res){
	
	fs.readFile('./users.ejs', {encoding: 'utf-8'}, function(err, filestring){
		if(err){
			throw err;
		}
		else {
			
			var options = {
				host: 'localhost',
				port: 1337,
				path: '/users',
				method: 'GET',
				headers: {
					accept: 'application/json'
				}
			}
			
			var externalRequest = http.request(options, function(externalResponse) {
				console.log('Connected');
				externalResponse.on('data', function(chunk) {
					
					var userdata = JSON.parse(chunk);
					
					var dataEdited = "{\"users\" : "+ JSON.stringify(userdata) + "}";
					console.log(dataEdited);
					console.log(userdata);
					
					var html = ejs.render(filestring, JSON.parse(dataEdited));
					res.setHeader('content-type', 'text/html');
					res.writeHead(200);
					res.write(html);
					res.end();
				});
			});
			
			externalRequest.end();
		}
	});
});


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


app.listen(1338, function(){
	console.log("Server listens on Port 1338");
});
