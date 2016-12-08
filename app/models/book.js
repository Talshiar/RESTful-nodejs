var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var Schema = mongoose.Schema;

var bookSchema = new Schema({
    _id : Number,
    name : String,
    author : String
});

bookSchema.plugin(autoIncrement.plugin, { model: 'Book' });

module.exports = mongoose.model('Book', bookSchema);