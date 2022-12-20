
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
swapTransactionHelper: any,
utils: any,
ecdsaHelper: any,
addressFromPublicKeyHelper: any,
swapUtilsHelper: any,
standardStatuses: any,
smartContractHelper: any



module.exports = function () {
  const utils: any= {};

  utils.increaseTimeOutCount = function() {
    // if(!this.count){
    //   this.count = 0
    // }
    // this.count += 1;
    // console.log(this.count)
  },

  utils.getCount= function() {
    // return this.count || 0;
  },

  utils.pick = function(object: any, keys: any){
    return keys.reduce((obj: any, key: any) => {
      if (object && Object.prototype.hasOwnProperty.call(object, key)) {
        // eslint-disable-next-line no-param-reassign
        obj[key] = object[key];
      }
      return obj;
    }, {});
  },

  utils.bridgeContractVersions = {
    V1_0: '000.003',
    V1_2: '001.200',
  },

  utils.expectedSchemaVersionV1_0 = '1.0'
  utils.expectedSchemaVersionV1_2 = '1.2'
  utils.globalTokenExpiryTime = '1800s'

  return utils;
}