const { db, asyncMiddleware, commonFunctions, stringHelper } = global
var mongoose , {isValidObjectId} = require('mongoose');
var bscScanHelper = global.bscScanHelper;
const Web3= require("web3")

module.exports = function (router) {

  router.get('/calculate', async (req, res) => {

    const rs  = []

    const tokens = [
        {
            "tokenContract":"0xaf329a957653675613D0D98f49fc93326AeB36Fc",
            "tokenSymbol": "cFRM"
        },
        {
            "tokenContract":"0x1fC45F358D5292bEE1e055BA7CebE4d4100972AE",
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

    const calculateApr = async (tokenContract,symbol) => {

        const skakingContract = "0x35E15ff9eBB37D8C7A413fD85BaD515396DC8008"

        const ApeRouter = "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7"
    
        const taxDistributor = '0x1e01bA3C2a882601c685F0542E897ED278B6cffB'
    
    
        let aprCycle = 365
        
        let rewardCycle = 1
    
        var tsToday = Math.round(new Date().getTime() / 1000);
    
        var tsYesterday = tsToday - (24 * 3600);
    
        const currentDayTimeStamp = tsToday
    
        const last24HoursTimeStamp = tsYesterday

        const UnitPrice = await bscScanHelper.queryContract(ApeRouter,tokenContract)
        
        const currentDayblockBlockNumber = await bscScanHelper.queryBlockNumber(currentDayTimeStamp)
    
        const previousDayBlockNumber = await bscScanHelper.queryBlockNumber(last24HoursTimeStamp)
      
        const transactions = await bscScanHelper.queryByCABNAndToken(tokenContract,skakingContract,previousDayBlockNumber,currentDayblockBlockNumber)

        const stakedAmountValue = await bscScanHelper.queryStakingContract(skakingContract,tokenContract)
        
        const distributorTransactions = []
    
        let dailyRewardAverageValue = 0

        for(let item of transactions||[]){

            if(item.from.toLowerCase()  === taxDistributor.toLowerCase()){
    
                distributorTransactions.push(item)
    
                const etherValue = Web3.utils.fromWei(item.value||0,'ether')
    
                dailyRewardAverageValue += Number(etherValue || 0)
    
            }
    
        }
    
        let dailyRewardAverageUsdValue = UnitPrice * dailyRewardAverageValue
    
        const stakedAmountUsdValue = UnitPrice * stakedAmountValue
    
        const APR = ((dailyRewardAverageUsdValue * ( aprCycle / rewardCycle ) ) / stakedAmountUsdValue) * 100

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

    for(let item of tokens){
        const response = await calculateApr(item.tokenContract,item.tokenSymbol)
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

  });

};