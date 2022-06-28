var cron = require("node-cron");

module.exports =  async function ():Promise<void> {
  if ((global as any).starterEnvironment.isCronEnvironmentSupportedForMultiTokenStakingLeaderboardJob === "yes") {
    try {
      let isLock: boolean = false
      cron.schedule("*/5 * * * *", async ():Promise<void>  => {
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

async function startJob():Promise<void> {
  console.log("multi token staking leaderboard cron")
  let stakingContracts = await db.StakingsContractsAddresses.find({ isActive: true });
  let cabns = getStakingsCabns(stakingContracts)
  let cabsValueInUsd = await getCurrencyAddressesByNetworkUsd(cabns)
  for(let i:number = 0; i < stakingContracts.length; i++) {
    var walletsBalancesOfStakeContract = await mSLGTrackerHelper.getWalletsBalancesByCABN(stakingContracts[i].currencyAddressByNetwork)
    let participantsHoldings = await mSLGTrackerHelper.getStakesHolderGrowthWithHoldings(stakingContracts[i]._id)
    await mSLGCalculations.updateParticipantsStakingHoldings(walletsBalancesOfStakeContract, participantsHoldings, stakingContracts[i]._id, cabsValueInUsd, stakingContracts[i].leaderboard)
  }


    let leaderboardCabns = getLeaderboardCabns(stakingContracts)
    let leaderboardCabnsKeys =  Object.keys(leaderboardCabns)
    for(var i:number = 0; i < leaderboardCabnsKeys.length; i++) {
      let leaderboardId:any = leaderboardCabnsKeys[i]
       await mSLGCalculations.updateParticipantsStakingGrowth(leaderboardId, leaderboardCabns[leaderboardId], cabsValueInUsd)
    }

    console.log(` contract calcuation completed`)
}

function getStakingsCabns(stakingContracts: any):Array<string>{
  let cabns:Set<string> = new Set();
  stakingContracts.forEach((stakingContract: any):void => {
    cabns.add(stakingContract.currencyAddressByNetwork)
  });
  return [...cabns];
}


function getLeaderboardCabns(stakingContracts: any):Array<Array<string>>{
  let leaderboardCabns:Array<Array<string>> = []
  stakingContracts.forEach((stakingContract: any):void => {
    if(!leaderboardCabns[stakingContract.leaderboard]){
      leaderboardCabns[stakingContract.leaderboard] = []
    }
    if(leaderboardCabns[stakingContract.leaderboard]){
      let temp =leaderboardCabns[stakingContract.leaderboard]
      temp.push(stakingContract.currencyAddressByNetwork)
      leaderboardCabns[stakingContract.leaderboard] = temp
    }
  });
  return leaderboardCabns;
}

async function getCurrencyAddressesByNetworkUsd(cabns: any) {
  let cabsUsd: any = []
  let currencies = await db.Currencies.find({ currencyAddressesByNetwork:{$in:cabns} }).select('currencyAddressesByNetwork valueInUsd name');
  currencies.forEach((currency: any) => {
      currency.currencyAddressesByNetwork.forEach((cabn: any) =>{
        let usd = currency.valueInUsd ? currency.valueInUsd : 0
        cabsUsd[cabn] = {USD:usd, name:currency.name}
      })
  })
  return cabsUsd
}

