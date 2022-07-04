import Web3 from "web3";
import * as apeRouterAbi from "../../../config/apeRouterAbi.json"

var cron = require("node-cron");
var coinGeckoHelper = (global as any).coinGeckoHelper;

module.exports = async function () {
  if ((global as any).starterEnvironment.isCronEnvironmentSupportedForStakingLeaderboardCurreniesUSDJob === "yes") {
    try {
      let isLock = false;
      cron.schedule("*/5 * * * *", async () => {
        if (!isLock) {
          isLock = true;
                
        let currencies = await getStakingCurrencies(); 
        let coinGeckoIds:any = []
        let contractsPaths:any = [] 
      
        currencies = currencies.forEach((currency: any) =>{
          if(currency.coinGeckoId){
            coinGeckoIds.push(currency.coinGeckoId);
          }else if(currency.currencyAddressesByNetwork.usdValueConversionPath){
            if(currency.currencyAddressesByNetwork.usdValueConversionPath.length > 0){
              contractsPaths.push({currencyId:currency._id, contractAddress:currency.currencyAddressesByNetwork.tokenContractAddress, path: currency.currencyAddressesByNetwork.usdValueConversionPath})
            }
          }
        })
        //store from coin gecho
          if(coinGeckoIds.length > 0){   
            var currciesUSDValues = await coinGeckoHelper.getTokensUSDValues(coinGeckoIds)
            if(currciesUSDValues.length>0){
             await storeCurrenciesUsdInDbWIthCoinGeckoId(currciesUSDValues)              
            }
          }

          //store from contract address paths
          if(contractsPaths.length>0){
            let currciesUSDValues  = []
            for(let i = 0; i < contractsPaths.length; i++) {
             let valueInUsd = await getTokensUSDValues(contractsPaths[i].contractAddress,contractsPaths[i].path )
              if(valueInUsd){
                currciesUSDValues.push({currencyId:contractsPaths[i].currencyId, contractAddress: contractsPaths[i].contractAddress, valueInUsd})
              }
            }
            if(currciesUSDValues.length > 0){
              await storeCurrenciesUsdInDbWithCurrencyId(currciesUSDValues)
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
  let stakingCabns = await db.StakingsContractsAddresses.find({isActive: true}).select('currencyAddressByNetwork')
  let currenciesCabns: any = new Set();
  stakingCabns.forEach((cabn: any)=>{
      currenciesCabns.add(cabn.currencyAddressByNetwork)
  })
  
  currenciesCabns = [...currenciesCabns]
  if(currenciesCabns.length > 0)
   return await db.Currencies.aggregate(
    [
      {
        '$match': {
          'isActive': true, 
          'currencyAddressesByNetwork':{$in:currenciesCabns}
        }
      }, {
        '$unwind': {
          'path': '$currencyAddressesByNetwork', 
          'preserveNullAndEmptyArrays': false
        }
      }, {
        '$lookup': {
          'from': 'currencyAddressesByNetwork', 
          'localField': 'currencyAddressesByNetwork', 
          'foreignField': '_id', 
          'as': 'currencyAddressesByNetwork'
        }
      },
      {
        '$unwind': {
          'path': '$currencyAddressesByNetwork', 
          'preserveNullAndEmptyArrays': false
        }
      },
    ] 
   )
  else
  return []
}


async function storeCurrenciesUsdInDbWIthCoinGeckoId(currciesUSDValues: any){

  let data: any = []
  currciesUSDValues.forEach((usdValue: any)=>{
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
  if(data.length > 0)
  await db.Currencies.collection.bulkWrite(data);

}
async function storeCurrenciesUsdInDbWithCurrencyId(currciesUSDValues: any){

  let data: any = []
  currciesUSDValues.forEach((usdValue: any)=>{
    data.push({
      updateOne: {
        filter: {
          _id: usdValue.currencyId
        },
        update: {
          $set: {
            valueInUsd: usdValue.valueInUsd,
            valueInUsdUpdatedAt: new Date(),
          },
        },
      },
    });
  })
  if(data.length > 0)
  await db.Currencies.collection.bulkWrite(data);

}

async function getTokensUSDValues(contractAddress:string ,path:any[]): Promise<any> {
  let web3Client = new Web3('https://bsc-dataseed1.binance.org')    
  const ApeContract = new web3Client.eth.Contract(apeRouterAbi.abi as any[], "0x10ED43C718714eb63d5aA57B78B54704E256024E");
  let pricingRoute = [contractAddress, ...path];
  const response = await ApeContract.methods.getAmountsOut( "1000000000000000000", pricingRoute ).call()
    if (response.length > 0) {
      return web3Client.utils.fromWei(response[response.length - 1], 'ether')
    }
    return null
}
