import { any } from "bluebird";

var cron = require("node-cron");
var mSLGTrackerHelper = (global as any).mSLGTrackerHelper;
var mSLGCalculations = (global as any).mSLGCalculations;

module.exports =  async function () {
  if ((global as any).starterEnvironment.isCronEnvironmentSupportedForMultiTokenStakingLeaderboardJob === "yes") {
    try {     
      let isLock = false
      cron.schedule("*/5 * * * *", async () => {
        if (!isLock) {         
          isLock = true;
          await startJob()        
          isLock = false;        
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
};

async function startJob(){
  return 0
  console.log("multi token staking leaderboard cron")
  let stakingContracts = await db.StakingsContractsAddresses.find({ isActive: true });
  console.log(stakingContracts)
  let cabns = getStakingsCabns(stakingContracts)
  let cabsValueInUsd = await getCurrencyAddressesByNetworkUsd(cabns)
  
  
 
  for(let i = 0; i < stakingContracts.length; i++) { 

   // let walletsBalancesOfStakeContract = []
   // for(let j = 0; j < stakingContracts[i].currencyAddressesByNetwork.length; j++) {        
      var walletsBalancesOfStakeContract = await mSLGTrackerHelper.getWalletsBalancesByCABN(stakingContracts[i].currencyAddressesByNetwork)
      //walletsBalancesOfStakeContract = walletsBalancesOfStakeContract.concat(walletsBalancesOfCABN)
   // } 
   
    let participantsHoldings = await mSLGTrackerHelper.getStakesHolderGrowthWithHoldings(stakingContracts[i]._id)  // get holdings with leaderboard                          
    await mSLGCalculations.updateParticipantsStakingHoldings(walletsBalancesOfStakeContract, participantsHoldings, stakingContracts[i]._id, cabsValueInUsd, stakingContracts[i].leaderboard)
                                             
    }


    for(var i = 0; i < stakingContracts.length; i++) { 
    await mSLGCalculations.updateParticipantsStakingGrowth(stakingContracts[i].leaderboard) // move in other loop
    }

    console.log(`${stakingContracts[i]._id} contract calcuation completed`)   
}

function getStakingsCabns(stakingContracts: any){
  let cabns = new Set();
  stakingContracts.forEach((stakingContract: any) => {
    stakingContract.currencyAddressesByNetwork.forEach((address: any) => {
      cabns.add(address)
    })
  });
  return [...cabns];
}

async function getCurrencyAddressesByNetworkUsd(cabns: any) { 
  let cabsUsd: any = []
  let currencies = await db.Currencies.find({ currencyAddressesByNetwork:{$in:cabns} }).select('currencyAddressesByNetwork , valueInUsd');
  currencies.forEach((currency: any) => {
      currency.currencyAddressesByNetwork.forEach((cabn: any) =>{
        cabsUsd[cabn] = currency.valueInUsd
      })
  })
  return cabsUsd
}

