var mSLGTrackerHelper = global.mSLGTrackerHelper;
var Web3= require("web3")

module.exports = {
  async updateParticipantsStakingHoldings(wallestBalances, participantsHoldings, stakingContractId ,cabsValueInUsd, leaderboardId) {
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

  async updateParticipantsStakingGrowth(leaderboardId){
    let growths = await mSLGTrackerHelper.getParticipantsHoldingsGrowthInUsd(leaderboardId);
    growths = growths.sort((participant1, participant2) => participant1.totalGrowthInUsd > participant2.totalGrowthInUsd ? -1 : 1 );
    growths = this.calculateRankAndLevelUpAmount(growths);
    await mSLGTrackerHelper.updateStakesHolderGrowth(growths);
  },

  async storeNewParticipants(newHoldings, stakingContract, leaderboardId) {
    let uniqueWalletAddresses =new Set();
     newHoldings.forEach((holding) => {
      uniqueWalletAddresses.add( holding.tokenHolderAddress);
    });
    uniqueWalletAddresses = [...uniqueWalletAddresses]
    console.log(uniqueWalletAddresses.length,'uniqueWalletAddresses');
    let stakingGrowth = uniqueWalletAddresses.map(address => {return {stakeHolderWalletAddress:address, stakingContract, leaderboard:leaderboardId}})
    console.log(stakingGrowth.length,'stakingGrowth');
    return await mSLGTrackerHelper.storeStakholdersGrowths(stakingGrowth);
  },

  calculateTotalHoldingUSDValue(stakedAmount, walletCurrentBalance, usdValue){
    let value = 0
    if(usdValue){
       value =  (parseInt(stakedAmount) + Web3.utils.fromWei(walletCurrentBalance,'ether')) * usdValue
    }
    return value
  },

  prepareHoldingsData(wallestBalances, participantsGrowths, cabnsValueInUsd) {
    let holdings = [];
    let notFoundHoldings = [];
    wallestBalances.forEach((wallestBalance) => {
      let index = participantsGrowths.findIndex((participant) => participant.stakeHolderWalletAddress === wallestBalance.tokenHolderAddress);
      let usdValue = cabnsValueInUsd[wallestBalance.currencyAddressesByNetwork ]
      if (index > -1) {
        let holding = undefined
        if(participantsGrowths[index].holdings){
          holding = participantsGrowths[index].holdings.find(holding=> holding.tokenContractAddress == wallestBalance.tokenContractAddress)
        }

        let stakedAmount = holding ? holding.stakedAmount: '0'
        holdings.push({
          tokenContractAddress: wallestBalance.tokenContractAddress,
          totalHoldingUSDValue: this.calculateTotalHoldingUSDValue(stakedAmount, wallestBalance.tokenHolderQuantity, usdValue),
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

  calculateRankAndLevelUpAmount(holdings) {
    for (var i = 0; i < holdings.length; i++) {
      holdings[i].rank = i + 1;
      holdings[i].levelUpAmount = i > 0 ? this.calculateLevelUpAmount(holdings[i - 1], holdings[i]) : 0;
    }
    return holdings
  },

  calculateLevelUpAmount(previousParticipantGrowth, currentParticipantGrowth) {
    let levelUpAmountDefaultFactor = 1;
    return (previousParticipantGrowth.totalGrowthInUsd - currentParticipantGrowth.totalGrowthInUsd + levelUpAmountDefaultFactor);
  },
};
