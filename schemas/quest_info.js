var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const quest_info = mongoose.Schema({
    quest_name : String,
    request_person_id : String,
    title : String,
    context : String,
    location : String,
    people_num_max : Number,
    people_num : Number,
    users : Array,
    type:String
}, { usePushEach: true });

module.exports = quest_info;