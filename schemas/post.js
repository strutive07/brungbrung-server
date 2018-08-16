var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const post = mongoose.Schema({
    room_id : String,
    user : String,
    title: String,
    context : String,
    created_at : String,
    report_cnt : Number,
    comments : Array
}, { usePushEach: true });

module.exports = post;