/**
 * Primary file for the API
 * 
 */

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// Instantiate the HTTP server
var httpServer = http.createServer(function (request, response) {
    unifiedServer(request,response)
});

// Instantiate the HTTPS server
var httpsServerOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert:  fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions,function (request, response) {
    unifiedServer(request,response)
});

// Start the Https server, and have it listen on port
httpsServer.listen(config.httpsPort, function () {
    console.log(`The server is listening on port ${config.httpsPort} in ${config.envName} now. He support protocol https`);
});


// Start the server, and have it listen on port 3000
httpServer.listen(config.httpPort, function () {
    console.log(`The server is listening on port ${config.httpPort} in ${config.envName} now`);
});

// All the server logic for both https and https server
var unifiedServer = function (request, response) {
    // get the url and parse it
    var parsedUrl = url.parse(request.url, true);

    // get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    var queryStringObject = parsedUrl.query;

    // get the HTTP method
    var method = request.method.toLowerCase();

    // get the headers as an object
    var headers = request.headers;

    // Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    request.on('data', function (data) {
        buffer += decoder.write(data);
    });

    request.on('end', function () {
        buffer += decoder.end()

        // Choose the handler this request should go to. If one is not found, use not found handler
        var chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        var data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload: buffer
        }

        // Route the request to handler specified in the router
        chosenHandler(data, function (statusCode, payload) {
            // Use the status code called back by the handle, or default to status code 200
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            // Use the paylod called back by the handle, or default to empty object
            payload = typeof (payload) == 'object' ? payload : {};

            // Conver the payload to a string
            var payloadString = JSON.stringify(payload);

            // Return the response
            response.setHeader('Content-type', 'application/json')
            response.writeHead(statusCode);
            response.end(payloadString);

            // Log the request path
            console.log('Return this response: ', statusCode, payloadString);
        });
    });
}


// Define the handlers
var handlers = {};

// Ping Handler
handlers.ping = function(data, callback) {
    callback(200)
};

// Not Found Handlers
handlers.notFound = function (data, callback) {
    callback(404);
};

// Define a request router
var router = {
    'ping': handlers.ping
};