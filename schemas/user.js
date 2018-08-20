var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name : String,
    auth_id : String,
    hashed_password : String,
    created_at : String,
    temp_password : String,
    temp_password_time : String,
    room_string : Array, // 홈페이지 토큰 값.
    birth : String
}, { usePushEach: true });


module.exports = userSchema;