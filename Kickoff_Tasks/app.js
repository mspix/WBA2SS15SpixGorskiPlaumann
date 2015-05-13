var fs = require('fs');

fs.readFile(__dirname+"/wolkenkratzer.json", function(err, data) {
	
	data = JSON.parse(data);
	
	for(var i in data.wolkenkratzer) {
		console.log('Name:\t' + data.wolkenkratzer[i].name);
		console.log('Stadt:\t' + data.wolkenkratzer[i].stadt);
		console.log('Höhe:\t' + data.wolkenkratzer[i].hoehe);
		console.log('--------------------');
	}		

});