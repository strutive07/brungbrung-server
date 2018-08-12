var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const chat = mongoose.Schema({
    room_id : String,
    users : Array,
    messages:Array
}, { usePushEach: true });

module.exports = chat;