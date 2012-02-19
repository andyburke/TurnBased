var models = require( './models.js' );
var checks = require( './checks.js' );

var uuid = require( 'node-uuid' );
var sha1 = require( 'sha1' );

exports.bindToApp = function( app ) {
    app.post( '/api/1.0/Player', function( request, response ) {
    
        if ( !request.param( 'username' ) )
        {
            response.json( 'You must specify a username to sign up!', 400 );
            return;
        }

        models.Player.findOne( { 'username': request.param( 'username' ).toLowerCase() }, function( error, player ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            if ( player )
            {
                response.json( 'A player with username "' + request.param( 'username' ) + '" already exists.', 403 );
                return;
            }
            
            player = new models.Player();
            player.username = request.param( 'username' ).toLowerCase();
            player.uuid = uuid.v4();
            player.passwordHash = request.param( 'password' ) ? sha1( request.param( 'password' ) ) : null;
            
            player.save( function( error ) {
                if ( error )
                {
                    response.json( error, 500 );
                    return;
                }
        
                request.session.player = player;
                request.session.save();
                
                response.json( models.censor( player, { 'passwordHash': true } ) );
            });
        });
    });
    
    app.put( '/api/1.0/Player', checks.player, function( request, response ) {

        function save()
        {
            models.Player.findById( request.session.player._id, function( error, player ) {
                player.username = typeof( request.params.username ) != undefined ? request.params.username.toLowerCase() : player.username;
                player.passwordHash = typeof( request.params.password ) != undefined ? sha1( request.params.password ) : player.passwordHash;
  
                player.save( function( error ) {
                    if ( error )
                    {
                        response.json( error, 500 );
                        return;
                    }
                                        
                    request.session.player = player;
                    request.session.save();
                    
                    response.json( models.censor( player, { 'passwordHash': true } ) );
                });
            });
        }
        
        if ( request.params.username )
        {
            models.User.findOne( { 'username': request.params.username.toLowerCase() }, function( error, player ) {
                if ( error )
                {
                    response.json( error, 500 );
                    return;
                }
                
                if ( player )
                {
                    response.json( 'A player already exists with that username.', 409 );
                    return;
                }
                
                save();
            });
        }
        else
        {
            save();
        }
    });
    
    app.get( '/api/1.0/Player', checks.player, function( request, response ) {
        response.json( models.censor( request.session.player, { 'passwordHash': true } ) );
    });
    
    app.get( '/api/1.0/Player/:username', function( request, response ) {
        models.Player.findOne( { 'username': request.params.username.toLowerCase() }, function( error, player ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            if ( !player )
            {
                response.json( 'No player found with username: ' + request.params.username, 404 );
                return;
            }
            
            response.json( models.censor( player, { 'passwordHash': true } ) );
        });
    });
}