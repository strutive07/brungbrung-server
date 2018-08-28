var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const survey = mongoose.Schema({
    room_id : String,
    survey_form : Array,
    survey:Array
}, { usePushEach: true });

module.exports = survey;