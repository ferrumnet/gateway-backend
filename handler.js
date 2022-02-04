'use strict';
var app = require('./server');
var serverless = require('serverless-http');

module.exports.appHandler = serverless(app)
