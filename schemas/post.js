var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const post = mongoose.Schema({
    room_id : String,
    user_auth_id : String,
    user_name : String,
    title: String,
    context : String,
    created_at : String,
    report_cnt : Number,
    comments : Array,
    images_cnt : Number,
    images : Array
}, { usePushEach: true });

module.exports = post;