/**
 * This file will serve our app using Node's built in Cluster
 *
 * @see http://nodejs.org/api/cluster.html 
 */

// Initialize the cluster and get reference to http object
var cluster = require('cluster')
  , http = require('http');

var cpus = require('os').cpus().length || 1;

// If we're the master, fork for each CPU
if ( cluster.isMaster ) {
	for ( var i = 0; i < cpus; ++i )
		cluster.fork();
} else {
	
	// Gets reference to app from ./app.js
	// app type is express
	var app = require('./app');

	// create http listener, using app as base
	module.exports = http.createServer(app).listen(app.get('port'), function(){
		// logging code
		console.warn('footprints service listening on port ' + app.get('port'));
	});
}

