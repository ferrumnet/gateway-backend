
declare const db: any,
asyncMiddleware: any,
commonFunctions: any,
stringHelper: any,
leaderboardHelper: any,
organizationHelper: any,
timeoutHelper: any,
tokenHolderBalanceSnapshotEventHelper: any,
CGTrackerHelper: any,
competitionHelper: any,
calcaluteGrowthVolume: any,
bscScanHelper: any,
cTSnapshotHelper: any,
currencyHelper: any,
bscScanTokenHolders: any,
addressesHelper: any,
raisePoolsHelper: any,
usersHelper: any,
profileMiddleware: any,
stakingTrackerHelper: any,
crucibleAprsHelper: any,
logsHelper: any,
stakingHelper: any,
mSLGTrackerHelper: any,
mSLGCalculations: any,
timeoutCallBack: any,
networksHelper: any,
dexesHelper: any,
productsHelper: any,
packagesHelper: any,
web3ConfigurationHelper: any,
web3Helper: any,
contractHelper: any,
signatureHelper: any,
swapTransactionHelper: any


const utils = {

  increaseTimeOutCount() {
    // if(!this.count){
    //   this.count = 0
    // }
    // this.count += 1;
    // console.log(this.count)
  },

  getCount() {
    // return this.count || 0;
  },

  pick(object: any, keys: any){
    return keys.reduce((obj: any, key: any) => {
      if (object && Object.prototype.hasOwnProperty.call(object, key)) {
        // eslint-disable-next-line no-param-reassign
        obj[key] = object[key];
      }
      return obj;
    }, {});
  }

};

module.exports = utils;
