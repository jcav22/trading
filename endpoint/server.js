var http = require('http');
var dispatcher = require('httpdispatcher');
var server = http.createServer(handleRequest);
var socket = require('socket.io').listen(server);
var mongoose = require('mongoose');
//var toobusy = require('toobusy');

const PORT = process.env.PORT || 8080;

var db = mongoose.connection;
var Transaction, transactionSchema;

// set up the database and model
db.on( 'error', console.error );
db.once( 'open', function() {
    console.log( 'connected to DB' );
    transactionSchema = new mongoose.Schema({
        userId: String
        , currencyFrom: String
        , currencyTo: String
        , amountSell: Number
        , amountBuy: Number
        , rate: Number
        , timePlaced: Date
        , originatingCountry: String
    });

    Transaction = mongoose.model( 'Transaction', transactionSchema );
});

mongoose.connect('mongodb://trading:1234@waffle.modulusmongo.net:27017/pat3oHid');

// Start the server
server.listen( PORT, function() {
    console.log( "Server listening on: http://localhost:%s", PORT );
});

function handleRequest( request, response ) {
    // if ( toobusy() ) {
    //     response.send(503, "The server is busy right now, sorry.");
    
    // } else {
    try {
        console.log( "URL: %s", request.url );
        dispatcher.dispatch( request, response );
    } catch( err ) {
        console.log( err );
    }
    // }
}

// POST data request
dispatcher.onPost( "/post1", function( req, res ) {
    var reqObject, register;
    console.log( req.method + " to " + req.url );
    
    if ( req.body.length > 1e6 ) { // FLOOD ATTACK OR FAULTY CLIENT
        res.writeHead( 400, {'Content-Type': 'text/plain'} );
        res.end( 'Too Much Post Data' );
    }

    try {
        reqObject = JSON.parse( req.body );
        
        if( isValidObj(reqObject) ) {
            register = new Transaction({
                userId:                 reqObject.userId
                , currencyFrom:         reqObject.currencyFrom
                , currencyTo:           reqObject.currencyTo
                , amountSell:           reqObject.amountSell
                , amountBuy:            reqObject.amountBuy
                , rate:                 reqObject.rate
                , timePlaced:           new Date(reqObject.timePlaced)
                , originatingCountry:   reqObject.originatingCountry
            });
            
            register.save( function( err, register ) {
                if ( err ) return console.error( err );
            });
            
            messageProcessor( reqObject );
        }

    } catch ( e ) {
        res.writeHead( 400, {'Content-Type': 'text/plain'} );
        res.end( 'Unable to parse the Json object' );
    }

    res.writeHead( 200, {'Content-Type': 'text/plain'} );
    res.end( 'Got Post Data' );
});

var global = {};
global.buy = {};            // total amount buyed per type
global.sell = {};           // total amount selled per type
global.transactions = {};   // total transaction/exchange type
global.countries = {};      // total transactions/country
global.dataGraph = {};      // data for graph

function messageProcessor( obj ) {
    var exchangeType, amountSell, amountBuy, country;
    var data = {};

    exchangeType = String(obj.currencyFrom).toUpperCase() + "/" + String(obj.currencyTo).toUpperCase();
    country = String(obj.originatingCountry).toUpperCase();
    amountSell = parseFloat(obj['amountSell']);
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

socket.on( 'connection', function( socket ) {
    socket.on( 'getData', function( data ) {        
        socket.emit( 'message', JSON.stringify(global) );
    });
    socket.on( 'getLastTrans', function( data ) {
        var lastRegs = [];
        var q = Transaction.find().sort( '-date' ).limit( 5 );
        
        q.exec( function( err, posts ) {
            var i;
            for( i = 0; i < posts.length; i++ )
                lastRegs.push( {
                    date:           posts[i].timePlaced
                    , exchange:     posts[i].currencyFrom + '/' + posts[i].currencyTo
                    , amountSell:   posts[i].amountSell
                    , rate:         posts[i].rate
                } );
            
            socket.emit( 'lastTrans', JSON.stringify(lastRegs) );
        });
    });
});

function isValidObj( obj ) {
    return  /^[a-zA-Z]{3}/.test( obj.currencyFrom ) 
            && /^[a-zA-Z]{3}/.test( obj.currencyTo ) 
            && /^[a-zA-Z]{2}/.test( obj.originatingCountry )
            && !isNaN(parseFloat( obj['amountSell'] )) && isFinite( obj['amountSell'] )
            && !isNaN(parseFloat( obj['amountBuy'] )) && isFinite( obj['amountBuy'] );
}
