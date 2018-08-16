var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var schema = require('../schemas/post');

module.exports = mongoose.model('post', schema);
