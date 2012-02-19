var models = require( './models.js' );
var checks = require( './checks.js' );

exports.bindToApp = function( app ) {
    app.get( '/api/1.0/Game/:gameId/Turns', function( request, response ) {
        models.Game.findById( request.params.gameId, function( error, game ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            if ( !game )
            {
                response.json( "No game with id: " + request.params.gameId, 404 );
                return;
            }
            
            models.Turn.find( { 'gameId': game._id }, function( error, turns ) {
                if ( error )
                {
                    response.json( error, 500 );
                    return;
                }
                
                turns.sort( function( lhs, rhs ) {
                    return lhs.createdAt < rhs.createdAt;
                });
                
                response.json( turns );
            });
        });
    });
    
    app.get( '/api/1.0/Game/:gameId/WhoseTurnIsIt', function( request, response ) {
        models.Game.findById( request.params.gameId, function( error, game ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            if ( !game )
            {
                response.json( "No game with id: " + request.params.gameId, 404 );
                return;
            }
            
            models.Turn.find().where( 'gameId', game._id ).desc( 'createdAt' ).limit( 1 ).exec( function( error, turns ) {
                if ( error )
                {
                    response.json( error, 500 );
                    return;
                }
                
                if ( turns.length == 0 )
                {
                    response.json( game.players[ 0 ] );
                    return;
                }

                var turn = turns[ 0 ];
                
                for ( var playerIndex = 0; playerIndex < game.players.length; ++playerIndex )
                {
                    if ( game.players[ playerIndex ] == turn.playerUUID )
                    {
                        response.json( game.players[ ( playerIndex + 1 ) % game.players.length ] );
                        return;
                    }
                }
            });
        });
    });

    app.post( '/api/1.0/Game/:gameId/Turn', checks.player, function( request, response ) {
        models.Game.findById( request.params.gameId, function( error, game ) {
            if ( error )
            {
                response.json( error, 500 );
                return;
            }
            
            if ( !game )
            {
                response.json( "No game found with id: " + request.params.gameId, 404 );
                return;
            }
            
            var newTurn = new models.Turn();
            newTurn.gameId = game._id;
            newTurn.playerUUID = request.session.player.uuid;
            newTurn.data = request.params.data;
            
            newTurn.save( function( error ) {
                if ( error )
                {
                    response.json( error, 500 );
                    return;
                }
                
                response.json( newTurn );
            });
        });
    });
};
        
