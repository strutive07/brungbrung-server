var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var schema = require('../schemas/survey');

module.exports = mongoose.model('survey', schema);
