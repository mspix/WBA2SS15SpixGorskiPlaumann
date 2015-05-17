var fs = require('fs');
var chalk = require('chalk');

fs.readFile(__dirname+"/wolkenkratzer.json", function(err, data) {
	
	parsedData = JSON.parse(data);
	
	for(var i in parsedData.wolkenkratzer) {
		console.log(chalk.blue('Name:\t') + parsedData.wolkenkratzer[i].name);
		console.log(chalk.blue('Stadt:\t') + parsedData.wolkenkratzer[i].stadt);
		console.log(chalk.blue('Höhe:\t') + chalk.red(JSON.stringify(parsedData.wolkenkratzer[i].hoehe)));
		console.log(chalk.blue('--------------------'));
	}		

});