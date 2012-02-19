var models = require( './models.js' );

var sha1 = require( 'sha1' );

exports.player = function( request, response, next )
{
    if ( request.session.player )
    {
        next();
        return;
    }

    var username = null;
    var password = null;
    
    var authorization = request.headers.authorization;
    if ( authorization )
    {
        var parts = authorization.split(' ');
        var scheme = parts[0];
        var credentials = new Buffer( parts[ 1 ], 'base64' ).toString().split( ':' );
    
        if ( 'Basic' != scheme )
        {
            response.send( 'Basic authorization is the only supported authorization scheme.', 400 );
            return;
        }
        
        username = credentials[ 0 ];
        password = credentials[ 1 ];
    }
    else
    {
        username = request.params.username;
        password = request.params.password;
    }
    
    if ( !username )
    {
        response.json( "You must specify a username for authentication.", 400 );
        return;
    }

    models.Player.findOne( { 'username': username.toLowerCase() }, function( error, player ) {
        if ( error )
        {
            response.json( error, 500 );
            return;
        }
        
        if ( !player )
        {
            response.json( 'Could not locate a player with username: ' + username, 404 );
            return;
        }
        
        if ( player.passwordHash && player.passwordHash != sha1( password ) )
        {
            response.json( 'Invalid password.', 403 );
            return;
        }
        
        request.session.player = player;
        request.session.save();
        next();
        return;
    });
}

exports.ownsContext = function( request, response, next ) {

    if ( !request.session.user )
    {
        response.json( 'Server error: user session does not exist.  Please report this problem.', 500 );
        return;
    }
    
    models.Context.findById( request.params.contextId, function( error, context ) {
        if ( error )
        {
            response.json( error, 500 );
            return;
        }
        
        if ( !context )
        {
            response.json( 'No context for id: ' + request.params.contextId, 404 );
            return;
        }
        
        if ( context.owners.indexOf( request.session.user.hash ) == -1 )
        {
            response.json( 'You are not authorized to access this resource.', 403 );
            return;
        }

        request.context = context;
        next();
    });
}

exports.ownsAchievementClass = function( request, response, next ) {
    if ( !request.session.user )
    {
        response.json( 'Server programming error: user session does not exist when checking achievement class ownership.  Please report this problem.', 500 );
        return;
    }
    
    if ( !request.context )
    {
        response.json( 'Server programming error: context is not set when checking achievement class ownership.  Please report this problem.', 500 );
        return;
    }
    
    models.AchievementClass.findById( request.params.achievementClassId, function( error, achievementClass ) {
        if ( error )
        {
            response.json( error, 500 );
            return;
        }
        
        if ( !achievementClass )
        {
            response.json( 'No achievement class for id: ' + request.params.achievementClassId, 404 );
            return;
        }
        
        if ( !achievementClass.contextId.equals( request.context._id ) )
        {
            response.json( 'Context with id ' + request.context._id + ' does not own achievement class with id ' + achievementClass._id, 403 );
            return;
        }
        
        request.achievementClass = achievementClass;
        next();
    });
}