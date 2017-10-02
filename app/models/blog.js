var mongoose     = require('mongoose'); 
var crypto = require('crypto'); 
var Schema       = mongoose.Schema;

module.exports = function(mongoose) {
    
    // var CommentSchema = new Schema({
    //     person     : String,
    //     comment    : String
        
    // },
    // {
    //     timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    // });

    var BlogSchema   = new Schema({ 
  
        author:String,
        title : {type:String},
        body: String,
        upvoters:[{
                    userId:{type:String} 
                }],
        upvotes:{type:Number,default:0},
        done : Boolean,
        userId:String,
        imageUrl:String,
        comments: [{
            person:String,
            comment:String,
            created_at: { type: Date, default: Date.now },
            upvoters:[{
                    userId:{type:String} 
                }],
            upvotes:{type:Number,default:0},
            userId:String
            // commentId: {
            //     type: String,
            //     default: function() {
            //         return crypto.randomBytes(12).toString('hex');
            //     }
            // }

        }]


    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    });

    BlogSchema.index(
    {   
        title: 'text'
    });
    

    var models = {
      //Comments : mongoose.model('Comments', CommentSchema),
      Blog : mongoose.model('blogs', BlogSchema)
    };

    return models;
}
