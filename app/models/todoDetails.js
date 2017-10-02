var mongoose     = require('mongoose');  
var crypto = require('crypto'); 
var Schema       = mongoose.Schema;

var TodoSchemaDetails   = new Schema({  
    name : String,
    task: String,
    place:String,
    education:String,
    done : Boolean,
    myId:String
},
{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('TodoDetails', TodoSchemaDetails);