var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name : String,
    auth_id : String,
    hashed_password : String,
    phone_number : Number,
    point : Number,
    first_login : Boolean,
    created_at : String,
    temp_password : String,
    temp_password_time : String
});


module.exports = userSchema;