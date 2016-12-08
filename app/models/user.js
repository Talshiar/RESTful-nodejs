var mongoose = require('mongoose');
var Book = require('./book');
var autoIncrement = require('mongoose-auto-increment');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    _id : Number,
    username : String,
    password : String,
    books: [
        { type: Schema.Types.Number, ref: 'Book' }
    ]
});

userSchema.methods.validPassword = function(password) {
    return password == this.password;
}

userSchema.plugin(autoIncrement.plugin, { model: 'User' });

module.exports = mongoose.model('User', userSchema);