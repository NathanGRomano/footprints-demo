/**
 * Module dependencies.
 *
 * These are modules that are required to build our service.
 */

var express = require('express')
  , mongoose = require('mongoose')
  , http = require('http')
  , fs = require('fs');

/**
 * Mongoose Schemas and Models
 *
 * Mongoose is ORM for Mongo.  It allows for creating Schemas and Models for your application.
 *
 * @see http://mongoosejs.com/docs/guide.html
 */

/**
 * Create the Mongoose Connection to our Mongod DB URI
 *
 * @see http://mongoosejs.com/docs/api.html#index_Mongoose-createConnection
 */
mongoose.connect('mongodb://localhost/footprints');

/**
 * Create Mongoose Schema
 *
 * This schema will represent a footprint from a user "psid" onto our page "emid" 
 *
 * @see http://mongoosejs.com/docs/api.html#index_mongoose-Schema
 */
var FootprintSchema = mongoose.Schema({
	emid: String,
	psid: String,
	created: {type: Date, default: Date.now }
});

/** 
 * Create the Mongoose Model
 *
 * Models are created from schemas and associated with a connection
 *
 * @see http://mongoosejs.com/docs/api.html#index_Mongoose-model
 */
var Footprint = mongoose.model('Footprint', FootprintSchema);

/**
 * The resource we respond with
 *
 * The idea is we are using an <img /> tag for tracking a footprint 
 *
 * @see http://nodejs.org/api/fs.html
 */
var image = fs.readFileSync(__dirname+'/public/images/blank.png');

/**
 * Exprees Application
 *
 * @see http://expressjs.com/guide.html
 */

var app = express();

/**
 * Configure our application
 *
 * @see http://expressjs.com/api.html#app.configure
 */
app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
});

/**
 * Configure our application for the "development" env
 *
 * @see http://expressjs.com/api.html#app.configure
 */
app.configure('development', function(){
	app.use(express.errorHandler());
});

/**
 * Support the "content" parameter
 *
 * @see http://expressjs.com/api.html#app.param
 * @see http://nodejs.org/api/buffer.html
 */
app.param('content', function(req, res, next, content) {
	try {
		req.content = JSON.parse(new Buffer(content, 'base64').toString('ascii'));
	}
	catch(e) {
		return res.status(400).end(JSON.stringify({error: e.toString()}));
	}
	next();
});

/** 
 * Configure a route that will handle tracking the content
 *
 * @see http://expressjs.com/api.html#app.VERB
 * @see http://expressjs.com/api.html#app.routes
 */
app.get('/footprint/:content', function(req, res) {
	new Footprint(req.content).save(function(err, doc) {
		if (err)
			return res.status(503).end(JSON.stringify({error:err}));
		res.set('Content-Type', 'image/png');
		res.end(image);
	});
});

/** 
 * Configure a route that will read the footprints
 *
 * @see http://expressjs.com/api.html#app.VERB
 * @see http://expressjs.com/api.html#app.routes
 */
app.get('/footprints', function(req, res) {
	Footprint.find({}, function(err, docs) {
		if (err)
			return res.status(503).end(JSON.stringify({error:err}));
		res.end(JSON.stringify(docs));	
	});
});

/** 
 * We want to export the app instance so server.js can start the service for our app
 *
 * @see http://nodejs.org/api/modules.html
 */
module.exports = app;

console.log('e.g', new Buffer(JSON.stringify({emid:'mm020qj', psid:'t0m1khspy'})).toString('base64'));

