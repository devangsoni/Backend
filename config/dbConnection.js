
var config = require('./config.constants');
var mongoose = require('mongoose');

// database connection
let database = process.env.NODE_ENV;
mongoose.connect(config.dev);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database is successfully connected');
});