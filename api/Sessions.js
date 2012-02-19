var models = require( './models.js' );
var checks = require( './checks.js' );

var sha1 = require( 'sha1' );

exports.bindToApp = function( app ) {
    
    app.post( '/api/1.0/Session', checks.player, function( request, response ) {
        response.json( { 'created': true } );
    });
    
    app.del( '/api/1.0/Session', checks.player, function( request, response ) {
        if ( !request.session )
        {
            response.json( 'No current session.', 404 );
            return;
        }
    
        request.session.destroy( function() {
            response.json( { 'removed': true } );
        });
    });    
}