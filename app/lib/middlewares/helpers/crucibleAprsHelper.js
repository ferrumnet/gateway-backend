const { db, asyncMiddleware, commonFunctions, stringHelper, bscScanHelper } = global
var mongoose, { isValidObjectId } = require('mongoose');
const Web3= require("web3")

module.exports = {

  async crucibleAutoCalculateApr(req, res) {
    const rs = []

    const tokens = [
      {
        "tokenContract": "0x5732a2a84ec469fc95ac32e12515fd337e143eed",
        "tokenSymbol": "cFRM"
      },
      {
        "tokenContract": "0x422a9c44e52a2ea96422f0caf4a00e30b3e26a0d",
        "tokenSymbol": "cFRMx"
      }
      // ,
      // {
      //     "tokenContract":"0x84f624617bad7e349e194da0877120ee190e4730",
      //     "tokenSymbol": "cFRM / BNB LP"
      // },
      // {
      //     "tokenContract":"0x9528704e44feda5ea240363ee52731859683b1fb",
      //     "tokenSymbol": "cFRMx / BNB LP"
      // }
    ]

    const calculateApr = async (tokenContract, symbol) => {

      const skakingContract = "0xd87f304ca205fb104dc014696227742d20c8f10a"

      const ApeRouter = "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7"

      const taxDistributor = '0x7364b844f3b6a70a82e2516a380cbff7409bdf65'


      let aprCycle = 365

      let rewardCycle = 1

      var tsToday = Math.round(new Date().getTime() / 1000);

      var tsYesterday = tsToday - (24 * 3600);

      const currentDayTimeStamp = tsToday

      const last24HoursTimeStamp = tsYesterday

      const UnitPrice = await bscScanHelper.queryContract(ApeRouter, tokenContract)

      const currentDayblockBlockNumber = await bscScanHelper.queryBlockNumber(currentDayTimeStamp)

      const previousDayBlockNumber = await bscScanHelper.queryBlockNumber(last24HoursTimeStamp)

      const transactions = await bscScanHelper.queryByCABNAndToken(tokenContract, skakingContract, currentDayblockBlockNumber, previousDayBlockNumber)

      const stakedAmountValue = await bscScanHelper.queryStakingContract(skakingContract, tokenContract)

      const distributorTransactions = []

      let dailyRewardAverageValue = 0

      for (let item of transactions || []) {

        if (item.from === taxDistributor) {

          distributorTransactions.push(item)

          const etherValue = Web3.utils.fromWei(item.value || 0, 'ether')

          dailyRewardAverageValue += Number(etherValue || 0)

        }

      }

      let dailyRewardAverageUsdValue = UnitPrice * dailyRewardAverageValue

      const stakedAmountUsdValue = UnitPrice * stakedAmountValue

      const APR = (dailyRewardAverageUsdValue * (aprCycle / rewardCycle)) / stakedAmountUsdValue

      return {
        APR,
        "price": UnitPrice,
        "volumeOfRewardsDistributedInThePast24Hours": dailyRewardAverageValue,
        "totalStake": stakedAmountValue,
        "APR": APR,
        "tokenSymbol": symbol,
        "timeReference": tsToday + '-' + tsYesterday
      }
    }

    for (let item of tokens) {
      const response = await calculateApr(item.tokenContract, item.tokenSymbol)
      rs.push(response)
    }

    // "contract": tokenContract,
    // "price": UnitPrice,
    // "volumeOfRewardsDistributedInThePast24Hours": dailyRewardAverageValue,
    // "totalStake": stakedAmountValue,
    // "APR": APR,
    // "tokenSymbol": tokenSymbol

    return res.http200({
      priceDetails: rs
    });
  },
}
