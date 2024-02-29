
var Web3= require("web3")

module.exports = {
  async updateParticipantsStakingHoldings(wallestBalances: any, participantsHoldings: any, stakingContractId: any ,cabsValueInUsd: any, leaderboardId: any) {
    let holdingsData = this.prepareHoldingsData(wallestBalances, participantsHoldings, cabsValueInUsd);
    //store updated holdings
    if (holdingsData.holdings.length > 0) await mSLGTrackerHelper.updateStakesHolderHoldings(holdingsData.holdings);

    // store new holdings
    if (holdingsData.notFoundHoldings.length > 0) {
      let newParticipants = await this.storeNewParticipants(holdingsData.notFoundHoldings, stakingContractId, leaderboardId);
      
      holdingsData = this.prepareHoldingsData(holdingsData.notFoundHoldings, newParticipants, cabsValueInUsd);
      await mSLGTrackerHelper.updateStakesHolderHoldings(holdingsData.holdings);
    }
  },

  calculateLevelUpTokens(growths: any, leaderboardCabns: any, cabnsValueInUsd: any) {
    for (var i = 0; i < growths.length; i++) {
     let levelUpTokens:any[] = []
      for(var j = 0; j < leaderboardCabns.length; j++) {
       let cabnUSD = cabnsValueInUsd[leaderboardCabns[j]]
       if(cabnUSD){
        let buyTOlevelUp = growths[i].levelUpAmount/cabnUSD.USD
       levelUpTokens.push({cabn:leaderboardCabns[j], tokenName:cabnUSD.name, buyTOlevelUp})
       }
     }
     growths[i].levelUpTokensWithWalletBalance = levelUpTokens
    }
    return growths
  },


  async updateParticipantsStakingGrowth(leaderboardId: any, leaderboardCabns: any, cabnsValueInUsd: any){
    let growths = await mSLGTrackerHelper.getParticipantsHoldingsGrowthInUsd(leaderboardId);

    growths = growths.sort((participant1: any, participant2: any) => participant1.totalGrowthInUsd > participant2.totalGrowthInUsd ? -1 : 1 );
    growths = this.calculateRankAndLevelUpAmount(growths);
   growths = this.calculateLevelUpTokens(growths, leaderboardCabns, cabnsValueInUsd)
    await mSLGTrackerHelper.updateStakesHolderGrowth(growths);
  },

  async storeNewParticipants(newHoldings: any, stakingContract: any, leaderboardId: any) {
    let uniqueWalletAddresses: any =new Set();
     newHoldings.forEach((holding: any) => {
      uniqueWalletAddresses.add( holding.tokenHolderAddress);
    });
    uniqueWalletAddresses = [...uniqueWalletAddresses]
    console.log(uniqueWalletAddresses.length,'uniqueWalletAddresses');
    let stakingGrowth = uniqueWalletAddresses.map((address: any) => {return {stakeHolderWalletAddress:address, stakingContract, leaderboard:leaderboardId}})
    console.log(stakingGrowth.length,'stakingGrowth');
    return await mSLGTrackerHelper.storeStakholdersGrowths(stakingGrowth);
  },

  calculateTotalHoldingUSDValue(stakedAmount: any, walletCurrentBalance: any, usdValue: any){
    let value = 0
    if(usdValue){
       value =  (parseInt(stakedAmount) + Web3.utils.fromWei(walletCurrentBalance,'ether')) * usdValue
    }
    return value
  },

  prepareHoldingsData(wallestBalances: any, participantsGrowths: any, cabnsValueInUsd: any) {
    let holdings: any = [];
    let notFoundHoldings: any = [];
    wallestBalances.forEach((wallestBalance: any) => {
      let index = participantsGrowths.findIndex((participant: any) => participant.stakeHolderWalletAddress === wallestBalance.tokenHolderAddress);
      let cabnUsdValue = cabnsValueInUsd[wallestBalance.currencyAddressesByNetwork ]
      if (index > -1) {
        let holding:any|undefined = undefined
        if(participantsGrowths[index].holdings){
          holding = participantsGrowths[index].holdings.find((holding: any)=> holding.tokenContractAddress == wallestBalance.tokenContractAddress)
        }

        let stakedAmount = holding ? holding.stakedAmount: '0'
        holdings.push({
          tokenContractAddress: wallestBalance.tokenContractAddress,
          totalHoldingUSDValue: this.calculateTotalHoldingUSDValue(stakedAmount, wallestBalance.tokenHolderQuantity, cabnUsdValue.USD),
          walletCurrentBalance: wallestBalance.tokenHolderQuantity,
          stakedAmount: stakedAmount,
          stakingLeaderboardGrowthTracker:participantsGrowths[index]._id,
        });
      } else {
        notFoundHoldings.push(wallestBalance);
      }
    });
    return { holdings, notFoundHoldings };
  },

  calculateRankAndLevelUpAmount(holdings: any) {
    for (var i = 0; i < holdings.length; i++) {
      holdings[i].rank = i + 1;
      holdings[i].levelUpAmount = i > 0 ? this.calculateLevelUpAmount(holdings[i - 1], holdings[i]) : 0;
    }
    return holdings
  },

  calculateLevelUpAmount(previousParticipantGrowth: any, currentParticipantGrowth: any) {
    let levelUpAmount = 1;
    levelUpAmount += previousParticipantGrowth.totalGrowthInUsd
    levelUpAmount -= currentParticipantGrowth.totalGrowthInUsd
    return levelUpAmount
  },
};
