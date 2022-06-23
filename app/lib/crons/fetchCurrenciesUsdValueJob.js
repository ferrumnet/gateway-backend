var cron = require("node-cron");
var coinGeckoHelper = global.coinGeckoHelper;
var db = global.db;

module.exports = async function () {
  if (global.starterEnvironment.isCronEnvironmentSupportedForStakingLeaderboardCurreniesUSDJob === "yes") {
    try {
      let isLock = false;
      cron.schedule("*/5 * * * *", async () => {
        if (!isLock) {
          console.log("currenies usd value job")
          isLock = true;
                
        let currencies = await getStakingCurrencies();
        currencies = currencies.map(currency => currency.coinGeckoId);
      
          if(currencies.length>0){
           
            currciesUSDValues = await coinGeckoHelper.getTokensUSDValues(currencies)
          
            if(currciesUSDValues.length>0){
             await storeCurrenciesUsdInDb(currciesUSDValues)
              
            }
          }

          isLock = false;
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
};

async function getStakingCurrencies(){
  let stakingCabns = await db.StakingsContractsAddresses.find({isActive: true}).select('currencyAddressesByNetwork')

  let currenciesCabns = new Set();
  stakingCabns.forEach(cabns=>{
    cabns.currencyAddressesByNetwork.forEach(cabn=>{
      currenciesCabns.add(cabn)
    })
  })
  
  currenciesCabns = [...currenciesCabns]
  if(currenciesCabns.length > 0)
   return await db.Currencies.find({ isActive: true, currencyAddressesByNetwork:{$in:currenciesCabns}});
  else
  return []
}


async function storeCurrenciesUsdInDb(currciesUSDValues){

  let data = []
  currciesUSDValues.forEach(usdValue=>{
    data.push({
      updateOne: {
        filter: {
          coinGeckoId: usdValue.id
        },
        update: {
          $set: {
            valueInUsd: usdValue.current_price,
            valueInUsdUpdatedAt: new Date(),
          },
        },
      },
    });
  })
console.log(data[0])
  await db.Currencies.collection.bulkWrite(data);

}

