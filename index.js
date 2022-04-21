"use strict";
var express = require("express");
var cors = require("cors");
var kraken = require("kraken-js");
var path = require("path");
var asyncMiddleware = require("./app/lib/response/asyncMiddleware");
var options, app;

/*
 * Create and configure application. Also exports application instance for use by tests.
 * See https://github.com/krakenjs/kraken-js#options for additional configuration options.
 */
options = {
  onconfig: function (config, next) {
    /*
     * Add any additional config setup or overrides here. `config` is an initialized
     * `confit` (https://github.com/krakenjs/confit/) configuration object.
     */

    next(null, config);
  },
};

app = module.exports = express();

app.use(express.static(__dirname + "/public")); // set the static files location /public/img will be /img for users
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(cors());
global.pusher = require("./app/lib/notifications");
global.db = require("./app/models/index");
global.helper = require("./app/lib/middlewares/helpers/dateHelper");
global.stringHelper = require("./app/lib/middlewares/helpers/stringHelper");
global.utils = require("./app/lib/middlewares/utils");
global.startHelper = require("./app/lib/middlewares/helpers/startHelper");
global.starterEnvironment = global.startHelper.startHelperInit(process)
console.log(global.starterEnvironment)

global.environment={};
// if (
//   global.starterEnvironment.environmentTag == "dev" ||
//   global.starterEnvironment.environmentTag == "qa" ||
//   global.starterEnvironment.environmentTag == "uat"
// ) {
//   global.environment = require("./config/dev.qa.uat.environment.json");
// } else if (global.starterEnvironment.environmentTag == "staging") {
//   global.environment = require("./config/staging.environment.json");
// } else if (global.starterEnvironment.environmentTag == "prod") {
//   global.environment = require("./config/production.environment.json");
// }
global.sendGrid = require('./app/lib/httpCalls/sendGridEmail');
global.covalenthqBlock = require('./app/lib/httpCalls/findCovalenthqBlock');
global.bscScanTokenHolders = require('./app/lib/httpCalls/findTokenHolders');
global.mailer = require('./app/lib/mailer')();
global.log = require('./app/lib/logger')
global.appRoot = path.resolve(__dirname)
global._ = require('lodash')
global.moment = require('moment')
global.calcaluteGrowthVolume = require('./app/lib/middlewares/helpers/cronsHelpers/competitionGrowthCalculater');
global.bscScanHelper = require('./app/lib/httpCalls/bscScanHelper');
global.CGTrackerHelper = require('./app/lib/middlewares/helpers/competitionGrowthTrackerHelper');
global.cTSnapshotHelper = require('./app/lib/middlewares/helpers/competitionTransactionsSnapshotHelper');
global.competitionHelper = require('./app/lib/middlewares/helpers/competitionHelper');
global.stripeConnect = require('./config/stripe.json');
global.asyncMiddleware = asyncMiddleware
global.commonFunctions = require('./app/lib/middlewares/common');
global.timeoutCallBack = require('./app/lib/middlewares/helpers/timeoutCallBack');
global.helper = require('./app/lib/middlewares/helpers/dateHelper')
global.stringHelper = require('./app/lib/middlewares/helpers/stringHelper');
global.timeoutHelper = require('./app/lib/middlewares/helpers/timeoutHelper');
global.logsHelper = require('./app/lib/middlewares/helpers/logsHelper');
global.usersHelper = require('./app/lib/middlewares/helpers/usersHelper');
global.addressesHelper = require('./app/lib/middlewares/helpers/addressesHelper');
global.profileMiddleware = require('./app/lib/middlewares/profileMiddleware');
global.awsHelper = require('./app/lib/middlewares/helpers/awsHelper');
global.fetchCompetitionBlocksJob = require('./app/lib/crons/fetchCompetitionBlocksJob');
global.fetchCompetitionTransactionsJob = require('./app/lib/crons/fetchCompetitionTransactionsJob');
global.fetchTokenHoldersJob = require('./app/lib/crons/fetchTokenHoldersJob');
global.fetchTokenHolderBalanceSnapshotEventsJob = require('./app/lib/crons/fetchTokenHolderBalanceSnapshotEventsJob');
global.raisePoolsHelper = require('./app/lib/middlewares/helpers/raisePoolsHelper');
global.organizationHelper = require('./app/lib/middlewares/helpers/organizationHelper');
global.leaderboardHelper = require('./app/lib/middlewares/helpers/leaderboardHelper');
global.tokenHolderBalanceSnapshotEventHelper = require('./app/lib/middlewares/helpers/tokenHolderBalanceSnapshotEventHelper');

global.kraken = app.kraken
// const whitelist = global.environment.whitelist;
// const corsOptions = {
//   origin: function (origin, callback) {
//     console.log("Origin: ", origin);
//     if(origin){
//       if (whitelist.indexOf(origin) !== -1) {
//         callback(null, true)
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     }else {
//       callback(null, true)
//     }
//   }
// };
// app.use(cors(corsOptions));
app.use(kraken(options));
app.on("start", function () {
  global.kraken = app.kraken;
  global.log.info("Application ready to serve requests.");
  global.log.info("Environment: %s", app.kraken.get("env:env"));
});
