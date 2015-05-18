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

	sortedParsedData = parsedData.wolkenkratzer.sort(function(a, b) {
		return a.hoehe - b.hoehe;
	});

	parsedData.wolkenkratzer = sortedParsedData;

	output = JSON.stringify(sortedParsedData);

	fs.writeFile(__dirname+"/wolkenkratzer_sortiert.json", output, function(err) {
	console.log('It\'s saved!');
	});

		console.log('\n\nSortierte Liste:\n')

	for(var i in parsedData.wolkenkratzer) {
		console.log(chalk.blue('Name:\t') + parsedData.wolkenkratzer[i].name);
		console.log(chalk.blue('Stadt:\t') + parsedData.wolkenkratzer[i].stadt);
		console.log(chalk.blue('Höhe:\t') + chalk.red(JSON.stringify(parsedData.wolkenkratzer[i].hoehe)));
		console.log(chalk.blue('--------------------'));
	}

});
