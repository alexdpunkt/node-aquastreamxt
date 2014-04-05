/**
 * App
 *
 * @package node-aquastreamxt
 * @author Alexander Dick <alex@dick.at>
 */
aquastreamApi   = require('node-aquastreamxt-api');
conf            = require('nconf');
fs              = require('fs');

var express     = require('express'),
	http        = require('http'),
	socketio    = require('socket.io'),
	routes      = require('./routes'),
	path        = require('path');

// Load config file
conf.file({file: 'config.json'});

app = express();

app.configure(function() {
	app.set('port', conf.get('server:port'));
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/', routes.index);

app.post('/config', function(req, res) {

	var key     = req.body.key;
	var value   = req.body.value;

	conf.set(key, value);
	conf.save();

	res.send(conf.get());

});


var server = http.createServer(app).listen(app.get('port'), function(){
	console.log("Server listening on port " + app.get('port'));
});

io = socketio.listen(server, {
	log: false
});

io.sockets.on('connection', function (socket) {

});