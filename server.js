/**
 * This file will serve our app using Node's built in Cluster
 *
 * @see http://nodejs.org/api/cluster.html 
 */
var cluster = require('cluster')
  , http = require('http');

var cpus = require('os').cpus().length || 1;

if ( cluster.isMaster ) {
	for ( var i = 0; i < cpus; ++i )
		cluster.fork();
} else {
	var app = require('./app');

	module.exports = http.createServer(app).listen(app.get('port'), function(){
		console.warn('footprints service listening on port ' + app.get('port'));
	});
}

