var models = require( './models.js' );
var checks = require( './checks.js' );

exports.bindToApp = function( app ) {
    app.post( '/api/1.0/Game', checks.player, function( request, response ) {
        
        var game = new models.Game();
        game.gameType = request.param( 'gameType' );
        game.initialState = request.param( 'initialState' );
        game.maxPlayers = request.param( 'maxPlayers' ) ? request.param( 'maxPlayers' ) : 2;
        game.players = [ request.session.player.uuid ];
    
        game.save( function( error ) {
            if ( error )
            {
                response.json( error.message ? error.message : error, 500 );
                return;
            }
    
            response.json( game );
        });
    });
        
    app.get( '/api/1.0/Game/:gameId', function( request, response ) {
        models.Game.findById( request.params.gameId, function( error, game ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            if ( !game )
            {
                response.json( 'No game found with id: ' + request.params.gameId, 404 );
                return;
            }

            response.json( game );           
        });
    });

    app.get( '/api/1.0/Games', checks.player, function( request, response ) {
        models.Game.find( { 'players': request.session.player.uuid }, function( error, games ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            response.json( games );
        });
    });

    app.put( '/api/1.0/Game/:gameId/Players/:playerUUID', function( request, response ) {
        models.Game.findById( request.params.gameId, function( error, game ) {
            if ( error )
            {
                response.json( error );
                return;
            }
            
            if ( !game )
            {
                response.json( "Cloud not locate a game with id: " + request.params.gameId, 404 );
                return;
            }
            
            if ( game.maxPlayers == game.players.length )
            {
                response.json( "This game is already full.", 400 );
                return;
            }
            
            game.players.push( request.params.playerUUID );
            game.save( function( error ) {
                if ( error )
                {
                    response.json( error, 500 );
                    return;
                }
                
                response.json( game );
            });
        });
    });
}
