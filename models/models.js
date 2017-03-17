var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    created_at: { type: Date, default: Date.now }
});

var postSchema = new mongoose.Schema({
    created_by: String,
    created_at: { type: Date, default: Date.now },
    text: String,
    location: String
});


//Model Declaration
mongoose.model('User', userSchema);
mongoose.model('Post', postSchema);