app = require('express.io')();
app.http().io();

// Setup the ready route, join room and broadcast to room.
app.io.route('ready', function(req) {
	req.io.join(req.data);
	req.io.room(req.data).broadcast('announce', {
		message: 'New client in the ' + req.data + ' room. '
	});
});

app.io.route('location', function(req) {
	//req.io.join(req.data);
	console.log('location route');
	console.dir(req.data);
	req.io.room(req.data.room).broadcast('location', req.data);
});

// Send the client html.
app.get('/', function(req, res) {
	res.sendfile(__dirname + '/public/client.html');
});
var port = 8088;
app.listen(port);
console.log("App listening on port " + port);