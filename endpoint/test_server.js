/* 
 * POST Data Test
 */
var http = require('http');

var data1 = {"userId": "134256", "currencyFrom": "EUR", "currencyTo": "GBP", 
				"amountSell": 1000, "amountBuy": 747.10, "rate": 0.7471, 
				"timePlaced" : "24-JAN-15 10:27:44", "originatingCountry" : "FR"}
var data2 = {"userId": "134257", "currencyFrom": "GBP", "currencyTo": "EUR", 
				"amountSell": 1000, "amountBuy": 1253.9, "rate": 1.2539, 
				"timePlaced" : "24-JAN-15 10:29:44", "originatingCountry" : "ES"}
var data3 = {"userId": "134258", "currencyFrom": "EUR", "currencyTo": "DOL", 
				"amountSell": 12000, "amountBuy": 13553.9, "rate": 1.1239, 
				"timePlaced" : "25-JAN-15 10:29:44", "originatingCountry" : "ES"}
var data4 = {"userId": "134258", "currencyFrom": "PES", "currencyTo": "EUR", 
				"amountSell": '12000', "amountBuy": 13553.9, "rate": 1.1239, 
				"timePlaced" : "25-JAN-15 10:29:44", "originatingCountry" : "DI"}

var dataArray = [data1, data2, data3, data4]

var options = {
  host: '127.0.0.1',
  port: 8080,
  //hostname: 'trading-50789.onmodulus.net',
  path: '/post1',
  method: 'POST',
  dataType: 'json'
};

function sendRequest( data ) {
	//var start = new Date();
	var req = http.request( options, function( res ) {
		console.log( 'STATUS: ' + res.statusCode );
		//console.log( 'HEADERS: ' + JSON.stringify(res.headers) );
		res.setEncoding( 'utf8' );
		res.on( 'data', function( chunk ) {
			console.log( 'BODY: ' + chunk );
		});
	  	req.on('error', function( e ) {
	  		console.log( 'problem with request: ' + e.message );
		});
	});
	// write data to request body
	req.write( JSON.stringify(data) );
	req.end();
}

for (var i = 0; i < dataArray.length; i++) {
	sendRequest( dataArray[i] );
};

/*
 * End POST Data Test
 */
