const { db, asyncMiddleware, commonFunctions, stringHelper, bscScanHelper } = global
var mongoose, { isValidObjectId } = require('mongoose');
const Web3 = require("web3")
const tagDaily = 'daily'
const tagWeekly = 'weekly'
const tagMontly = 'montly'
const tagLifeTime = 'lifeTime'

module.exports = {

  async crucibleAutoCalculateApr(req, res, isFromApi = true) {

    var currentTime = new Date();
    var lastDay = new Date();
    var lastWeek = new Date();
    var lastMonth = new Date();

    lastDay.setHours(lastDay.getHours() - 24);
    lastWeek.setHours(lastWeek.getHours() - 168);
    lastMonth.setMonth(lastMonth.getMonth() - 3);

    console.log(currentTime)
    console.log(lastDay)
    console.log(lastWeek)
    console.log(lastMonth)

    var toTime = Math.round(new Date().getTime() / 1000);
    var fromTime = toTime - (24 * 3600);

    console.log("====old====")
    console.log(toTime)
    console.log(fromTime)
    console.log("====New====")
    console.log(Math.round(currentTime.getTime() / 1000))
    console.log(Math.round(lastDay.getTime() / 1000))
    console.log(Math.round(lastWeek.getTime() / 1000))
    console.log(Math.round(lastMonth.getTime() / 1000))

    this.calculateDaily(req, res, isFromApi)
    this.calculateWeekly(req, res, isFromApi)
    this.calculateMontly(req, res, isFromApi)
    this.calculateLideTime(req, res, isFromApi)

    if (isFromApi) {
      console.log("completed")
    }
  },
  async calculateDaily(req, res, isFromApi) {

    var toTime = Math.round(new Date().getTime() / 1000);
    var lastDay = new Date();
    lastDay.setHours(lastDay.getHours() - 24);
    var fromTime = Math.round(lastDay.getTime() / 1000);

    console.log("Daily")
    console.log("toTime: ", toTime)
    console.log("fromTime: ", fromTime)
    this.autoCalculateApr(req, res, isFromApi, toTime, fromTime, tagDaily)

  },
  async calculateWeekly(req, res, isFromApi) {

    var toTime = Math.round(new Date().getTime() / 1000);
    var lastWeek = new Date();
    lastWeek.setHours(lastWeek.getHours() - 168);
    var fromTime = Math.round(lastWeek.getTime() / 1000);

    console.log("Weekly")
    console.log("toTime: ", toTime)
    console.log("fromTime: ", fromTime)
    this.autoCalculateApr(req, res, isFromApi, toTime, fromTime, tagWeekly)

  },
  async calculateMontly(req, res, isFromApi) {

    var toTime = Math.round(new Date().getTime() / 1000);
    var lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    var fromTime = Math.round(lastMonth.getTime() / 1000);

    console.log("Montly")
    console.log("toTime: ", toTime)
    console.log("fromTime: ", fromTime)
    this.autoCalculateApr(req, res, isFromApi, toTime, fromTime, tagMontly)

  },
  async calculateLideTime(req, res, isFromApi) {

    this.autoCalculateApr(req, res, isFromApi, "", "", tagLifeTime)

  },
  async autoCalculateApr(req, res, isFromApi, toTime, fromTime, type) {
    const rs = []
    let crucibleAprsTokensData = await this.getLastCrucibleAprsToken();

    if (crucibleAprsTokensData && crucibleAprsTokensData.tokens
      && crucibleAprsTokensData.tokens.length > 0) {
      const tokens = crucibleAprsTokensData.tokens
      // const tokens = [
      //   {
      //     "tokenContract": "0xaf329a957653675613D0D98f49fc93326AeB36Fc",
      //     "tokenSymbol": "cFRM"
      //   },
      //   {
      //     "tokenContract": "0x1fC45F358D5292bEE1e055BA7CebE4d4100972AE",
      //     "tokenSymbol": "cFRMx"
      //   }
      // ]

      const calculateApr = async (tokenContract, symbol) => {

        const skakingContract = crucibleAprsTokensData.skakingContract
        const ApeRouter = crucibleAprsTokensData.apeRouter
        const taxDistributor = crucibleAprsTokensData.taxDistributor

        let aprCycle = 365

        let rewardCycle = 1

        const toTimeStamp = toTime

        const fromTimeStamp = fromTime

        const UnitPrice = await bscScanHelper.queryContract(ApeRouter, tokenContract)

        let toBlockNumber = "";

        let fromBlockNumber = "";

        if(type != tagLifeTime){
          console.log(type, "hitting")
          toBlockNumber = await bscScanHelper.queryBlockNumber(toTimeStamp)

          fromBlockNumber = await bscScanHelper.queryBlockNumber(fromTimeStamp)

        }

        const transactions = await bscScanHelper.queryByCABNAndToken(tokenContract, skakingContract, fromBlockNumber, toBlockNumber)

        const stakedAmountValue = await bscScanHelper.queryStakingContract(skakingContract, tokenContract)

        const distributorTransactions = []

        let dailyRewardAverageValue = 0

        for (let item of transactions || []) {

          if (item.from.toLowerCase() === taxDistributor.toLowerCase()) {

            distributorTransactions.push(item)

            const etherValue = Web3.utils.fromWei(item.value || 0, 'ether')

            dailyRewardAverageValue += Number(etherValue || 0)

          }

        }

        let dailyRewardAverageUsdValue = UnitPrice * dailyRewardAverageValue

        const stakedAmountUsdValue = UnitPrice * stakedAmountValue

        const APR = ((dailyRewardAverageUsdValue * (aprCycle / rewardCycle)) / stakedAmountUsdValue) * 100

        return {
          APR,
          "price": UnitPrice,
          "volumeOfRewardsDistributed": dailyRewardAverageValue,
          "totalStake": stakedAmountValue,
          "APR": APR,
          "tokenSymbol": symbol,
          "timeReference": toTime + '-' + fromTime
        }
      }

      for (let item of tokens) {
        const response = await calculateApr(item.tokenContract, item.tokenSymbol)
        rs.push(response)
      }

      await this.saveIntoCurcibleAprsDB(rs, type)
    }
  },
  async saveIntoCurcibleAprsDB(data, type) {
    let dataToSave = [];

    if (data && data.length > 0) {

      data.forEach(item => {

        if (item) {
          console.log(type)
          console.log(item)

          let setData = { tokenSymbol: item.tokenSymbol }

          let data = {}
          data.APR = item.APR
          data.timeReference = item.timeReference
          data.totalStake = item.totalStake
          data.price = item.price
          data.volumeOfRewardsDistributed = item.volumeOfRewardsDistributed
          data.updatedAt = new Date()

          if (type == tagDaily) {

            setData.dailyAPR = data

          } else if (type == tagWeekly) {

            setData.weeklyAPR = data

          } else if (type == tagMontly) {

            setData.monthlyAPR = data

          }else {

            setData.lifeTimeAPR = data

          }

          let update = { '$set': setData }

          dataToSave.push({
            updateOne: {
              filter: { tokenSymbol: item.tokenSymbol },
              update: update,
              upsert: true
            },
          });

        }
      });

      await db.CrucibleAprs.collection.bulkWrite(dataToSave)

    }

  },
  async getLastCrucibleAprsToken() {

    return await db.CrucibleAprsTokens.findOne()
      .sort({ createdAt: -1 })

  },
}
