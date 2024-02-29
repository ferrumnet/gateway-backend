import moment from 'moment';
var Web3 = require("web3");

module.exports = {
  async calculate(currencyAddressesByNetwork: any, stakingContractAddress: any) {
    let participants = await db.StakingsTracker.find({
      stakingContractAddress,
      currencyAddressesByNetwork,
    });
    participants = this.sortParticipants(participants);
    participants = this.participantsDataCalculation(participants);
    this.storeUpdatedGrowth(participants, currencyAddressesByNetwork);
  },

  sortParticipants(participants: any) {
    let sortedParticipants = participants.sort((participant1: any, participant2: any) => {
      let participant1Growth = Number(participant1.stakingLeaderboardBalance);
      let participant2Growth = Number(participant2.stakingLeaderboardBalance);
      return participant1Growth < participant2Growth ? 1 : -1;
    });
    return sortedParticipants;
  },

  participantsDataCalculation(sortedParticipants: any) {
    for (let i = 0; i < sortedParticipants.length; i++) {
      sortedParticipants[i].rank = i + 1;
      if (i > 0) {
        sortedParticipants[i].levelUpAmount = this.calculateLevelUpAmount(
          sortedParticipants[i - 1].stakingLeaderboardBalance,
          sortedParticipants[i].stakingLeaderboardBalance,
          i
        );
      } else {
        sortedParticipants[i].levelUpAmount = "0";
      }
    }
    return sortedParticipants;
  },

  calculateLevelUpAmount(
    previousParticipantGrowth: any,
    currentParticipantGrowth: any,
    index: any
  ) {
    let levelUpAmount: any = "";
    let growthFactor = 1;
    if (index > 0) {
      let previousParticipantGrowthBN = Number(previousParticipantGrowth);
      let currentParticipantGrowthBN = Number(currentParticipantGrowth);
      levelUpAmount =
        previousParticipantGrowthBN - currentParticipantGrowthBN + growthFactor;
    }
    return levelUpAmount.toString();
  },

  async storeUpdatedGrowth(participants: any, currencyAddressesByNetwork: any) {
    let data: any = [];
    const updatedAt = new Date();
    participants.forEach((participant: any) => {
      if (participant) {
        data.push({
          updateOne: {
            filter: {
              currencyAddressesByNetwork,
              user: participant.user,
              stakingContractAddress: participant.stakingContractAddress,
              stakeHolderWalletAddress: participant.stakeHolderWalletAddress,
              tokenContractAddress: participant.tokenContractAddress,
            },
            update: {
              $set: {
                levelUpAmount: participant.levelUpAmount,
                rank: participant.rank,
                updatedAt: updatedAt,
              },
            },
            upsert: true,
          },
        });
      }
    });
    await db.StakingsTracker.collection.bulkWrite(data);
  },

  async intiatParticipentsData(cabn: any, stakingContractAddress: any) {
    let filter = { currencyAddressesByNetwork: cabn, stakingContractAddress };
    let participants = await db.StakingsTracker.find(filter);
    if (participants.length == 0) {
      let result = await this.getIntialBalance(cabn, stakingContractAddress);
      if (result.length > 0) {
        result = this.sortParticipants(result);
        result = this.participantsDataCalculation(result);
        participants = await db.StakingsTracker.insertMany(result);
      }
      return participants;
    }
    await this.reSyncBlances(participants, cabn, stakingContractAddress);
    return await db.StakingsTracker.find(filter);
  },

  async reSyncBlances(participants: any, cabn: any, stakingContractAddress: any) {
    if (participants.length > 0) {
      let updatedAt = moment(participants[0].updatedAt);
      let currentTime = moment();
      if (currentTime.diff(updatedAt, "minutes") > 5) {
        console.log("more then 5 minutes");
        let participantsBalances = await this.getIntialBalance(
          cabn,
          stakingContractAddress
        );
        var result = this.RecalculateGrowth(participants, participantsBalances);
        result = this.sortParticipants(result);
        result = this.participantsDataCalculation(result);
        await this.storeUpdatedGrowth(result, cabn);
      }
    }
  },

  RecalculateGrowth(participants: any, participantsBalances: any) {
    participantsBalances.forEach((balance: any) => {
      let index = participants.findIndex(
        (participant: any) =>
          participant.stakeHolderWalletAddress ==
          balance.stakeHolderWalletAddress
      );
      if (index === -1) {
        participants.push(balance);
      } else {
        participants[index].walletBalance = balance.walletBalance;
        let stakedAmount = participants[index].stakedAmount
          ? Number(participants[index].stakedAmount)
          : 0;
        let stakingLeaderboardBalance =
          stakedAmount + Number(balance.walletBalance);
        participants[index].stakingLeaderboardBalance =
          stakingLeaderboardBalance.toString();
      }
    });
    return participants;
  },

  async getIntialBalance(currencyAddressesByNetwork: any, stakingContractAddress: any) {
    let filter = { currencyAddressesByNetwork };
    var result = await db.TokenHoldersCurrencyAddressesByNetwork.find(filter);
    if (result.length == 0) {
      result = await db.TokenHoldersCurrencyAddressesByNetworkSnapShot.find(
        filter
      );
    }
    if (result.length > 0) {
      result = result.map((item: any) => {
        let stakedAmount = Web3.utils.fromWei(
          item.tokenHolderQuantity,
          "ether"
        );
        return {
          currencyAddressesByNetwork,
          stakingContractAddress,
          tokenContractAddress: item.tokenContractAddress,
          stakeHolderWalletAddress: item.tokenHolderAddress,
          walletBalance: stakedAmount,
          stakingLeaderboardBalance: stakedAmount,
        };
      });
    }
    return result;
  },
};
