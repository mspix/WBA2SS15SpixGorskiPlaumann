var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var ejs = require('ejs');
var redis = require('redis');
var fs = require('fs');
var http = require('http');

var db = redis.createClient();
var app = express();

app.use(express.static(__dirname + '/public'));

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



app.get('/kinos', jsonParser, function(req, res){
	
	fs.readFile('./templates/index.ejs', {encoding: 'utf-8'}, function(err, filestring){
		if(err){
			throw err;
		}
		else {
			
		
			var reqQueryArray = req.query;
			
			var queryString = "";
			
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

					queryString += prop; 

					if(Array.isArray(reqQueryArray[prop])){
						queryString += "[]";
					}

					queryString += "=";

					if(Array.isArray(reqQueryArray[prop])){
						reqQueryArray[prop];
					}
					
					// ++i;
					// if(reqQueryArray[prop] != "" && Object.keys(reqQueryArray)[i+1] != "submit"){
						// console.log("next: " + Object.keys(reqQueryArray)[i+1]);
						// queryString += "&";
					// }
					
				}
			}
			
			console.log(queryString);
			
			var path = "/kinos"+queryString;
			
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
					
					var dataEdited = "{\"kinos\" : "+ JSON.stringify(userdata) + "}";
					// console.log(dataEdited);
					// console.log(userdata);
					
					var html = ejs.render(filestring, JSON.parse(dataEdited));
					res.setHeader('content-type', 'text/html');
					res.writeHead(200);

					res.write(html);

					res.end();
				});
			});
					// if(req.query !== undefined){
						// externalRequest.append('Link', JSON.stringify(req.query));
						// console.log("drin");
						// console.log(externalRequest.get('Link'));
					// }
							
			externalRequest.end();
		}
	});
});


app.get('/', function(req, res){
		// fs.readFile('./index.html', {encoding: 'utf-8'}, function(err, filestring){
	    // if(err){
			// throw err;
		// }
		// else {
					
					// var html = filestring;
					// res.setHeader('content-type', 'text/html');
					// res.writeHead(200);
					// res.write(html);
					// res.end();
					// console.log(html);
                    // res.send(html);

		// }
		// });


});


app.listen(1338, function(){
	console.log("Server listens on Port 1338");
});
