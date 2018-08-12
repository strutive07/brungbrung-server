var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var schema = require('../schemas/chat');

module.exports = mongoose.model('chat', schema);
