/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose = require('mongoose')
  , http = require('http')
  , fs = require('fs');

/**
 * Mongoose Schemas and Models
 *
 * @see http://mongoosejs.com/docs/guide.html
 */

mongoose.connect('mongodb://localhost/footprints');

var FootprintSchema = mongoose.schema({
	emid: String,
	psid: String,
	created: {type: Date, default: Date.now }
});

var Footprint = mongoose.model('Footprint', FootprintSchema);

/**
 * The resource we respond with
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

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.param('content', function(req, res, next, content) {
	try {
		//parse the content which is a base64 encoded JSON string
		req.content = JSON.parse(new Buffer(content, 'base64').toString('ascii'));
	}
	catch(e) {
		return res.status(400).end(JSON.stringify({error: e}));
	}

	//move onto the next route
	next();
});

app.get('/track/:content', function(req, res) {
	new Footprint(req.content).save(function(err, doc) {
		if (err)
			return res.status(503).end(JSON.stringify({error:err}));
		res.set('Content-Type', 'image/png');
		res.end(image);
	});
});

http.createServer(app).listen(app.get('port'), function(){
 	console.log("Express server listening on port " + app.get('port'));
});
