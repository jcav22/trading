var baseSeconds = new Date().getTime() / 60000;
var socket = io.connect( 'http://trading-50789.onmodulus.net/' /*'http://localhost:8080/'*/ );
var realData = [], labels = []; // for the chart
socket.connect();
socket.on( 'message', loadData );
socket.on( 'lastTrans', loadLastTrans );

function getDate( date ) {
    date = new Date( date );
    return date.getDate() + "-" + date.getMonth() + "-" + date.getYear()
            + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function loadLastTrans( msg ) {
    var i, content, date, obj;

    msg = JSON.parse( msg );
    
    for( i = 0; i < msg.length; i++ ) {
        obj = msg[i];
        date = new Date( obj.date );

        $("#lastTransactions").append( "<div class='transaction'><h3>" 
            + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear()
            + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
            + "</h3><div class='trans_data'>" + obj.exchange + ": " + obj.amountSell 
            + " at rate " + obj.rate + "</div></div>" );
    }
    
}

function loadData( msg ) {
    obj = JSON.parse( msg );
    refresh( obj );
    renderGraph();
}

function refresh( obj ) {
    var trans = [];
    var countries = [];
    var i;
    
    for(key in obj.transactions)
        trans.push( {'name': key, 'value': obj.transactions[key]} );
    trans.sort(compare);

    for(key in obj.countries)
        countries.push( {'name': key, 'value': obj.countries[key]} );
    countries.sort(compare);

    i = 0;
    $("#totalTrans ol").empty();
    while( i < trans.length && i < 5 ) {
        $("#totalTrans ol").append( '<li>' + trans[i].name + ': ' + trans[i].value +'</li>' );
        i++;
    }
    
    i = 0;
    $("#totalCountries ol").empty();
    while( i < countries.length && i < 5 ) {
        $("#totalCountries ol").append( '<li>' + countries[i].name + ': ' + countries[i].value +'</li>' );
        i++;
    }
    
    var graph = obj.dataGraph;
    var n = 0;
    realData = [];
    labels = [];
    for( var key in graph ) {
        if ( graph.hasOwnProperty(key) && key.length > 3 && n < 5 ) {
            realData.push( graph[key] );
            labels.push( key );
        }
        n++;
    }
}

function compare( a, b ) {
    if ( a['value'] < b['value'] )
        return 1;
    if ( a['value'] > b['value'] )
        return -1;
    return 0;
}

$(document).ready( function() {
    socket.emit( 'getData', "" );
    socket.emit( 'getLastTrans', "" );
});