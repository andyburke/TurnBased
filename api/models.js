var mongoose = require( 'mongoose' );
var MongooseTypes = require( 'mongoose-types' );
MongooseTypes.loadTypes( mongoose );
var UseTimestamps = MongooseTypes.useTimestamps;

// TODO: make this be on the mongoose model prototype
var censor = exports.censor = function ( object, fields )
{
    var censored = {};
    for ( var key in ( object._doc || object ) )
    {
        if ( !( key in fields ) )
        {
            censored[ key ] = object[ key ];
        }
    }
    return censored;
}

exports.PlayerSchema = new mongoose.Schema({
    uuid: { type: String, unique: true, index: true },
    username: { type: String, unique: true, index: true },
    passwordHash: { type: String }
});
exports.PlayerSchema.plugin( UseTimestamps );
exports.Player = mongoose.model( 'Player', exports.PlayerSchema );

exports.GameSchema = new mongoose.Schema({
    gameType: { type: String, index: true },
    initialState: { type: String },
    maxPlayers: { type: Number },
    players: { type: Array, index: true },
    completed: { type: Date }
});
exports.GameSchema.plugin( UseTimestamps );
exports.Game = mongoose.model( 'Game', exports.GameSchema );

exports.TurnSchema = new mongoose.Schema({
    gameId: { type: mongoose.Schema.ObjectId, index: true },
    playerUUID: { type: mongoose.Schema.ObjectId, index: true },
    data: { type: String }
});
exports.TurnSchema.plugin( UseTimestamps );
exports.Turn = mongoose.model( 'Turn', exports.TurnSchema );
