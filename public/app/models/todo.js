var mongoose     = require('mongoose');
var textSearch = require('mongoose-text-search'); 
var crypto = require('crypto'); 
var Schema       = mongoose.Schema;

var TodoSchema   = new Schema({  
    name : {type:String},
    task: String,
    done : Boolean,
    myId: {
        type: String,
        default: function() {
            return crypto.randomBytes(12).toString('hex');
        }
    }
},
{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

TodoSchema.plugin(textSearch);
TodoSchema.index({name:'text',task:'text'});

module.exports = mongoose.model('todos', TodoSchema);