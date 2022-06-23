var cron = require("node-cron");
var mSLGTrackerHelper = global.mSLGTrackerHelper;
var mSLGCalculations = global.mSLGCalculations;
var db = global.db;

module.exports =  async function () {
  if (global.starterEnvironment.isCronEnvironmentSupportedForMultiTokenStakingLeaderboardJob === "yes") {
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
  console.log("multi token staking leaderboard cron")
  let stakingContracts = await db.StakingsContractsAddresses.find({ isActive: true });
  let cabns = getStakingsCabns(stakingContracts)
  let cabsValueInUsd = await getCurrencyAddressesByNetworkUsd(cabns)
  
  for(let i = 0; i < stakingContracts.length; i++) {

    let walletsBalancesOfStakeContract = []
    for(let j = 0; j < stakingContracts[i].currencyAddressesByNetwork.length; j++) {        
      var walletsBalancesOfCABN = await mSLGTrackerHelper.getWalletsBalancesByCABN(stakingContracts[i].currencyAddressesByNetwork[j])
      walletsBalancesOfStakeContract = walletsBalancesOfStakeContract.concat(walletsBalancesOfCABN)
    } 
   
    let participantsHoldings = await mSLGTrackerHelper.getStakesHolderGrowthWithHoldings(stakingContracts[i]._id)                            
    await mSLGCalculations.updateParticipantsStakingHoldings(walletsBalancesOfStakeContract, participantsHoldings, stakingContracts[i]._id, cabsValueInUsd)
    await mSLGCalculations.updateParticipantsStakingGrowth(stakingContracts[i]._id)
    console.log(`${stakingContracts[i]._id} contract calcuation completed`)                                           
    }  
}

function getStakingsCabns(stakingContracts){
  let cabns = new Set();
  stakingContracts.forEach(stakingContract => {
    stakingContract.currencyAddressesByNetwork.forEach(address => {
      cabns.add(address)
    })
  });
  return [...cabns];
}

async function getCurrencyAddressesByNetworkUsd(cabns) { 
  let cabsUsd = []
  let currencies = await db.Currencies.find({ currencyAddressesByNetwork:{$in:cabns} }).select('currencyAddressesByNetwork , valueInUsd');
  currencies.forEach(currency => {
      currency.currencyAddressesByNetwork.forEach(cabn =>{
        cabsUsd[cabn] = currency.valueInUsd
      })
  })
  return cabsUsd
}

