var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var ParseCloud = require('parse-cloud-express');
var Parse = ParseCloud.Parse;

var app = express();

// Host static files from public/
app.use(express.static(__dirname + '/public'));

// Define a Cloud Code function:
Parse.Cloud.define('hello', function(req, res) {
    res.success('Hello from Cloud Code on Node.');
});

// Mount the Cloud Code routes on the main Express app at /webhooks/
// The cloud function above will be available at /webhooks/function_hello
app.use('/webhooks', ParseCloud.app);

// Launch the HTTP server
var port = process.env.PORT || 5000;
var server = http.createServer(app);
server.listen(port, function() {
    console.log('Cloud Code on Node running on port ' + port + '.');
});



// Require Node Modules
var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    Parse = require('parse/node'),
    ParseCloud = require('parse-cloud-express');

var app = express();

// Import your cloud code (which configures the routes)
require('./cloud/main.js');
// Mount the webhooks app to a specific path (must match what is used in scripts/register-webhooks.js)
app.use('/webhooks', ParseCloud.app);

// Host static files from public/
app.use(express.static(__dirname + '/public'));

// Catch all unknown routes.
app.all('/', function(request, response) {
    response.status(404).send('Page not found.');
});
/*
 * Launch the HTTP server
 */
var port = process.env.PORT || 5000;
var server = http.createServer(app);
server.listen(port, function() {
    console.log('Cloud Code Webhooks server running on port ' + port + '.');
});
