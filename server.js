'use strict';

var app = require('./index');
var http = require('http');
var webSockets = require('./app/lib/webSockets');

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
(async () => {
  await global.awsHelper.awsSecretsManagerInit()
  var mongoString = global.environment.mongoConnectionUrl;
  var mongoLogger = function(coll, method, query, doc) {
    global.log.debug(coll + '.' + method + '( ' + JSON.stringify(query) +  ', ' + JSON.stringify(doc) + ' )');
  };

  //mongoose.set('debug', true); // mongoose.set('debug', mongoLogger)

  mongoose.connect(mongoString, function(error, db) {
    if (error) {
      global.log.error(error);
    } else {
      // global.fetchCompetitionBlocksJob()
      global.fetchCompetitionTransactionsJob()
      global.fetchTokenHoldersJob()
      global.fetchTokenHolderBalanceSnapshotEventsJob()
      global.fetchCrucibleApr()
      global.log.info('Connected to MongoDB');
    }
  });

  var server = http.Server(app);
  server.listen(process.env.PORT || 8080);

  server.on('listening', function () {
    global.log.info('Server listening on http://localhost:%d', this.address().port);
  });
  global.io = require('socket.io').listen(server);
  global.io.on('connection', webSockets.newConnection);

})().catch(e => {
  console.log(e)
});
