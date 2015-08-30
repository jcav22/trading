var http = require('http');
var dispatcher = require('httpdispatcher'); // npm install httpdispatcher
// Create a server and socket.io
var server = http.createServer(handleRequest);
var socket = require('socket.io').listen(server); // npm install socket.io
var toobusy = require('toobusy');

// var mongoClient = require('mongodb').MongoClient;
// var mongoUrl = '';

const PORT = process.env.PORT || 8080;

function handleRequest( request, response ) {
    if ( toobusy() ) {
        response.send(503, "The server is busy right now, sorry.");

    } else {
        try {
            //console.log( "URL: %s", request.url );
            dispatcher.dispatch( request, response );
        } catch( err ) {
            console.log( err );
        }
    }
}

// Start the server
server.listen( PORT, function() {
    console.log( "Server listening on: http://localhost:%s", PORT );
});

// POST data request
dispatcher.onPost( "/post1", function( req, res ) {
    console.log( req.method + " to " + req.url );
    
    if ( req.body.length > 1e6 ) { // FLOOD ATTACK OR FAULTY CLIENT
        res.writeHead( 400, {'Content-Type': 'text/plain'} );
        res.end( 'Too Much Post Data' );
    }
    
    res.writeHead( 200, {'Content-Type': 'text/plain'} );
    res.end( 'Got Post Data' );
    messageProcessor( JSON.parse( req.body ) );
});

var global = {};
global.buy = {};    // total amount buyed per type
global.sell = {};   // total amount selled per type
global.transactions = {};   // total transaction/exchange type
global.countries = {};      // total transactions/country
global.dataGraph = {};      // data for graph

function messageProcessor( obj ) {
    var exchangeType;
    var amountSell, amountBuy;
    var country;
    var data = {};

    if( /^[a-zA-Z]{3}/.test(obj.currencyFrom) && /^[a-zA-Z]{3}/.test(obj.currencyTo) )
        exchangeType = String(obj.currencyFrom).toUpperCase() + "/" + String(obj.currencyTo).toUpperCase();
    if( /^[a-zA-Z]{2}/.test(obj.originatingCountry) )
        country = String(obj.originatingCountry).toUpperCase();
    if( !isNaN(parseFloat(obj['amountSell'])) && isFinite(obj['amountSell']) )
        amountSell = parseFloat(obj['amountSell']);
    if( !isNaN(parseFloat(obj['amountBuy'])) && isFinite(obj['amountBuy']) )
        amountBuy = parseFloat(obj['amountBuy']);

    if( exchangeType && country && amountBuy && amountSell ) {
        // total/exchange type
        if( !global.transactions[exchangeType] )
            global.transactions[exchangeType] = 0;
        global.transactions[exchangeType] += 1;

        // total/countries
        if( !global.countries[country] )
            global.countries[country] = 0;
        global.countries[country] += 1; 

        // total amount selled/currency
        if( !global.sell[obj.currencyFrom] )
            global.sell[obj.currencyFrom] = 0;

        // total amount buyed/currency
        if( !global.buy[obj.currencyTo] )
            global.buy[obj.currencyTo] = 0;

        global.sell[obj.currencyFrom] += amountSell;
        global.buy[obj.currencyTo] += amountBuy;

        // data for graph
        if( !global.dataGraph[exchangeType] )
            global.dataGraph[exchangeType] = 0;
        global.dataGraph[exchangeType] += 1;

        // emit the essage to the frontend
        socket.emit( 'message', JSON.stringify(global) );
    }
}

socket.on('connection', function(socket) {
    socket.on('getData', function(data) {
        console.log("get from the client");
        socket.emit('message', JSON.stringify(global));
    });
});

