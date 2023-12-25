import moment from 'moment';
var Web3 = require("web3")
const tagDaily = 'daily'
const tagWeekly = 'weekly'
const tagMontly = 'montly'
const tagLifeTime = 'lifeTime'

module.exports = {

  async crucibleAutoCalculateApr(req: any, res: any, isFromApi = true) {

    await this.calculateDaily(req, res, isFromApi)
    await this.calculateWeekly(req, res, isFromApi)
    await this.calculateMontly(req, res, isFromApi)
    await this.calculateLifeTime(req, res, isFromApi)

    if (isFromApi) {
    }
    console.log('fetchCrucibleApr cron completed')
  },
  async calculateDaily(req: any, res: any, isFromApi: any) {

    var toTime = Math.round(new Date().getTime() / 1000);
    var lastDay = new Date();
    lastDay.setHours(lastDay.getHours() - 24);
    var fromTime = Math.round(lastDay.getTime() / 1000);
    await this.autoCalculateApr(req, res, isFromApi, toTime, fromTime, tagDaily, 365)

  },
  async calculateWeekly(req: any, res: any, isFromApi: any) {

    var toTime = Math.round(new Date().getTime() / 1000);
    var lastWeek = new Date();
    lastWeek.setHours(lastWeek.getHours() - 168);
    var fromTime = Math.round(lastWeek.getTime() / 1000);
    await this.autoCalculateApr(req, res, isFromApi, toTime, fromTime, tagWeekly, 52)

  },
  async calculateMontly(req: any, res: any, isFromApi: any) {

    var toTime = Math.round(new Date().getTime() / 1000);
    var lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    var fromTime = Math.round(lastMonth.getTime() / 1000);
    await this.autoCalculateApr(req, res, isFromApi, toTime, fromTime, tagMontly, 12)

  },
  async calculateLifeTime(req: any, res: any, isFromApi: any) {

    await this.autoCalculateApr(req, res, isFromApi, "", "", tagLifeTime, 365)

  },
  async autoCalculateApr(req: any, res: any, isFromApi: any, toTime: any, fromTime: any, type: any, aprCycleInDays: any) {
    const rs = []
    let crucibleAprsTokensData = await this.getLastCrucibleAprsToken();

    if (crucibleAprsTokensData && crucibleAprsTokensData.tokens
      && crucibleAprsTokensData.tokens.length > 0) {
      const tokens = crucibleAprsTokensData.tokens

      const calculateApr = async (tokenContract: any, symbol: any) => {

        const skakingContract = crucibleAprsTokensData.skakingContract
        const ApeRouter = crucibleAprsTokensData.apeRouter
        const taxDistributor = crucibleAprsTokensData.taxDistributor

        let aprCycle = aprCycleInDays

        let rewardCycle = 1

        const toTimeStamp = toTime

        const fromTimeStamp = fromTime

        const UnitPrice = await bscScanHelper.queryContract(ApeRouter, tokenContract)

        let toBlockNumber = "";

        let fromBlockNumber = "";

        if(type != tagLifeTime){
          toBlockNumber = await bscScanHelper.queryBlockNumber(toTimeStamp)

          fromBlockNumber = await bscScanHelper.queryBlockNumber(fromTimeStamp)

        }

        const transactions = await bscScanHelper.queryByCABNAndToken(tokenContract, skakingContract, fromBlockNumber, toBlockNumber)

        const stakedAmountValue = await bscScanHelper.queryStakingContract(skakingContract, tokenContract)

        const distributorTransactions = []

        let dailyRewardAverageValue = 0
        let count = 0
        let totalCount = 0
        let zeroIndexDate;
        let lastIndexDate;

        if(type == tagLifeTime){
          totalCount = this.getFilteredTransactionLength(transactions, taxDistributor)
        }

        for (let item of transactions || []) {
          if (item.from.toLowerCase() === taxDistributor.toLowerCase()) {
            if(type == tagLifeTime){
              count+=1

              if(count == 1){
                zeroIndexDate = moment(item.timeStamp * 1000)
              }else if(count == totalCount){
                lastIndexDate = moment(item.timeStamp * 1000)
              }
            }
            distributorTransactions.push(item)

            const etherValue = Web3.utils.fromWei(item.value || 0, 'ether')

            dailyRewardAverageValue += Number(etherValue || 0)

          }

        }

        let dailyRewardAverageUsdValue = UnitPrice * dailyRewardAverageValue

        const stakedAmountUsdValue = UnitPrice * stakedAmountValue

        let APR = ((dailyRewardAverageUsdValue * (aprCycle / rewardCycle)) / stakedAmountUsdValue) * 100

        if(type == tagLifeTime){
          let lifetimeNumberOfDays = 0
          if(zeroIndexDate && lastIndexDate){
            lifetimeNumberOfDays = lastIndexDate.diff(zeroIndexDate, 'days')
          }

          APR = (((dailyRewardAverageUsdValue/lifetimeNumberOfDays)*aprCycle)/stakedAmountUsdValue)*100
        }

        return {
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
  async saveIntoCurcibleAprsDB(data: any, type: any) {
    let dataToSave: any = [];

    if (data && data.length > 0) {

      data.forEach((item: any) => {

        if (item) {

          let setData: any = { tokenSymbol: item.tokenSymbol }

          let data: any = {}
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
      console.log('====================='+type)
    }

  },
  async getLastCrucibleAprsToken() {

    return await db.CrucibleAprsTokens.findOne()
      .sort({ createdAt: -1 })

  },
  getFilteredTransactionLength(transactions: any, taxDistributor: any) {
    let count = 0

    if(transactions && transactions.length > 0){
      for (let item of transactions || []) {
        if (item.from.toLowerCase() === taxDistributor.toLowerCase()) {
          count+=1
        }
      }
    }

    return count
  },
}
