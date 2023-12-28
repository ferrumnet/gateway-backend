"use strict";
import express from "express";
var cors = require("cors");
var kraken = require("kraken-js");
import path from "path";
var options, app: any;

/*
 * Create and configure application. Also exports application instance for use by tests.
 * See https://github.com/krakenjs/kraken-js#options for additional configuration options.
 */
options = {
  onconfig: function (config: any, next: any) {
    /*
     * Add any additional config setup or overrides here. `config` is an initialized
     * `confit` (https://github.com/krakenjs/confit/) configuration object.
     */

    next(null, config);
  },
};

app = module.exports = express();

app.use(express.static(__dirname + "/public")); // set the static files location /public/img will be /img for users
app.use(function (req: any, res: any, next: any) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(cors());
(global as any).utils = require("./app/lib/middlewares/utils")();
(global as any).pusher = require("./app/lib/notifications");
(global as any).db = require("./app/models/index");
(global as any).helper = require("./app/helpers/dateHelper");
(global as any).stringHelper = require("./app/helpers/stringHelper");
(global as any).startHelper = require("./app/helpers/startHelper");
(global as any).starterEnvironment = (
  global as any
).startHelper.startHelperInit(process);
console.log((global as any).starterEnvironment);

if (
  (global as any).starterEnvironment.environmentTag == "dev" ||
  (global as any).starterEnvironment.environmentTag == "qa" ||
  (global as any).starterEnvironment.environmentTag == "uat"
) {
  (global as any).environment = require("./config/dev.qa.uat.environment.json");
} else if ((global as any).starterEnvironment.environmentTag == "staging") {
  (global as any).environment = require("./config/staging.environment.json");
} else if ((global as any).starterEnvironment.environmentTag == "prod") {
  (global as any).environment = require("./config/production.environment.json");
}
(global as any).sendGrid = require("./app/lib/httpCalls/sendGridEmail");
(
  global as any
).covalenthqBlock = require("./app/lib/httpCalls/findCovalenthqBlock");
(
  global as any
).bscScanTokenHolders = require("./app/lib/httpCalls/findTokenHolders");
(global as any).mailer = require("./app/lib/mailer")();
(global as any).log = require("./app/lib/logger");
(global as any).appRoot = path.resolve(__dirname);
(global as any)._ = require("lodash");
(
  global as any
).calcaluteGrowthVolume = require("./app/helpers/cronsHelpers/competitionGrowthCalculater");
(
  global as any
).mSLGCalculations = require("./app/helpers/cronsHelpers/multiStakingLeaderboardGrowthCalculator");
(global as any).bscScanHelper = require("./app/lib/httpCalls/bscScanHelper");
(
  global as any
).coinGeckoHelper = require("./app/lib/httpCalls/coinGeckoHelper");
(
  global as any
).mSLGTrackerHelper = require("./app/helpers/multiStakingLeaderboardGrowthTrackerHelper");
(
  global as any
).CGTrackerHelper = require("./app/helpers/competitionGrowthTrackerHelper");
(
  global as any
).stakingTrackerHelper = require("./app/helpers/stakingTrackerHelper");
(
  global as any
).cTSnapshotHelper = require("./app/helpers/competitionTransactionsSnapshotHelper");
(global as any).competitionHelper = require("./app/helpers/competitionHelper");
(global as any).stripeConnect = require("./config/stripe.json");
(global as any).asyncMiddleware = require("./app/lib/response/asyncMiddleware");
(global as any).commonFunctions = require("./app/lib/middlewares/common");
(global as any).timeoutCallBack = require("./app/helpers/timeoutCallBack");
(global as any).helper = require("./app/helpers/dateHelper");
(global as any).stringHelper = require("./app/helpers/stringHelper");
(global as any).timeoutHelper = require("./app/helpers/timeoutHelper");
(global as any).logsHelper = require("./app/helpers/logsHelper");
(global as any).usersHelper = require("./app/helpers/usersHelper");
(global as any).stakingHelper = require("./app/helpers/stakingHelper");
(global as any).addressesHelper = require("./app/helpers/addressesHelper");
(
  global as any
).profileMiddleware = require("./app/lib/middlewares/profileMiddleware");
(global as any).awsHelper = require("./app/helpers/awsHelper");
(
  global as any
).fetchCompetitionBlocksJob = require("./app/lib/crons/fetchCompetitionBlocksJob");
(
  global as any
).multiTokenStakingLeaderboardJob = require("./app/lib/crons/multiTokenStakingLeaderboardJob");
(
  global as any
).stakingLeaderboardCurrenciesUSDValueJob = require("./app/lib/crons/fetchCurrenciesUsdValueJob");
(
  global as any
).fetchCompetitionTransactionsJob = require("./app/lib/crons/fetchCompetitionTransactionsJob");
(
  global as any
).fetchTokenHoldersJob = require("./app/lib/crons/fetchTokenHoldersJob");
(
  global as any
).fetchTokenHolderBalanceSnapshotEventsJob = require("./app/lib/crons/fetchTokenHolderBalanceSnapshotEventsJob");
(global as any).raisePoolsHelper = require("./app/helpers/raisePoolsHelper");
(
  global as any
).organizationHelper = require("./app/helpers/organizationHelper");
(global as any).leaderboardHelper = require("./app/helpers/leaderboardHelper");
(
  global as any
).tokenHolderBalanceSnapshotEventHelper = require("./app/helpers/tokenHolderBalanceSnapshotEventHelper");
(global as any).currencyHelper = require("./app/helpers/currencyHelper");
(
  global as any
).crucibleAprsHelper = require("./app/helpers/crucibleAprsHelper");
(global as any).fetchCrucibleApr = require("./app/lib/crons/fetchCrucibleApr");
(global as any).networksHelper = require("./app/helpers/networksHelper");
(global as any).dexesHelper = require("./app/helpers/dexesHelper");
(global as any).productsHelper = require("./app/helpers/productsHelper");
(global as any).packagesHelper = require("./app/helpers/packagesHelper");
(
  global as any
).web3ConfigurationHelper = require("./app/helpers/web3Helpers/web3ConfigurationHelper");
(global as any).web3Helper = require("./app/helpers/web3Helpers/web3Helper");
(
  global as any
).swapTransactionHelper = require("./app/helpers/multiSwapHelpers/swapTransactionHelper");
(
  global as any
).swapUtilsHelper = require("./app/helpers/multiSwapHelpers/swapUtilsHelper");
(
  global as any
).standardStatuses = require("./app/lib/response/standardStatuses");
(
  global as any
).smartContractHelper = require("./app/helpers/smartContractHelper");
(
  global as any
).withdrawTransactionHelper = require("./app/helpers/multiSwapHelpers/withdrawTransactionHelper");
(
  global as any
).fiberAxiosHelper = require("./app/lib/httpCalls/fiberAxiosHelper");
(
  global as any
).swapAndWithdrawTransactionsJob = require("./app/lib/crons/swapAndWithdrawTransactionsJob");
(
  global as any
).multiswapNodeAxiosHelper = require("./app/lib/httpCalls/multiswapNodeAxiosHelper");
(
  global as any
).nonEvmHelper = require("./app/helpers/multiSwapHelpers/nonEvmHelper");

(
  global as any
).nodeConfigurationsHelper = require("./app/helpers/multiSwapHelpers/nodeConfigurationsHelper");

(
  global as any
).nodeInfraAuthHelper = require("./app/helpers/authHelpers/nodeInfraAuthHelper");
(global as any).utils.IS_LOCAL_ENV = (global as any).environment.isLocalEnv;

(global as any).kraken = app.kraken;
app.use(kraken(options));
app.on("start", function () {
  (global as any).kraken = app.kraken;
  (global as any).log.info("Application ready to serve requests.");
  (global as any).log.info("Environment: %s", app.kraken.get("env:env"));
});
