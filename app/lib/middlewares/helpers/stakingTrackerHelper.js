const { db, moment } = global;
const Web3 = require("web3");

module.exports = {
  async calculate(currencyAddressesByNetwork, stakingContractAddress) {
    let participants = await db.StakingsTracker.find({
      stakingContractAddress,
      currencyAddressesByNetwork,
    });
    participants = this.sortParticipants(participants);
    participants = this.participantsDataCalculation(participants);
    this.storeUpdatedGrowth(participants, currencyAddressesByNetwork);
  },

  sortParticipants(participants) {
    let sortedParticipants = participants.sort((participant1, participant2) => {
      let participant1Growth = Number(participant1.totalStakedAmount);
      let participant2Growth = Number(participant2.totalStakedAmount);
      return participant1Growth < participant2Growth ? 1 : -1;
    });
    return sortedParticipants;
  },

  participantsDataCalculation(sortedParticipants) {
    for (let i = 0; i < sortedParticipants.length; i++) {
      sortedParticipants[i].rank = i + 1;
      if (i > 0) {
        sortedParticipants[i].levelUpAmount = this.calculateLevelUpAmount(
          sortedParticipants[i - 1].totalStakedAmount,
          sortedParticipants[i].totalStakedAmount,
          i
        );
      }
    }
    return sortedParticipants;
  },

  calculateLevelUpAmount(
    previousParticipantGrowth,
    currentParticipantGrowth,
    index
  ) {
    let levelUpAmount = "";
    let growthFactor = 1;
    if (index > 0) {
      let previousParticipantGrowthBN = Number(previousParticipantGrowth);
      let currentParticipantGrowthBN = Number(currentParticipantGrowth);
      levelUpAmount =
        previousParticipantGrowthBN - currentParticipantGrowthBN + growthFactor;
    }
    return levelUpAmount.toString();
  },

  async storeUpdatedGrowth(participants, currencyAddressesByNetwork) {
    let data = [];
    const updatedAt = new Date();
    participants.forEach((participant) => {
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

  async intiatParticipentsData(cabn, stakingContractAddress) {
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

  async reSyncBlances(participants, cabn, stakingContractAddress) {
    if (participants.length > 0) {
      let updatedAt = moment(participants[0].updatedAt);
      let currentTime = moment();
      if (currentTime.diff(updatedAt, "minutes") > 5) {
        console.log("more then 5 minutes");
        let participantsBalances = await this.getIntialBalance(
          cabn,
          stakingContractAddress
        );
        result = this.RecalculateGrowth(participants, participantsBalances);
        result = this.sortParticipants(result);
        result = this.participantsDataCalculation(result);
        await this.storeUpdatedGrowth(result, cabn);
      }
    }
  },

  RecalculateGrowth(participants, participantsBalances) {
    participantsBalances.forEach((balance) => {
      let index = participants.findIndex(
        (participant) =>
          participant.stakeHolderWalletAddress ==
          balance.stakeHolderWalletAddress
      );
      if (index === -1) {
        participants.push(balance);
      } else {
        participants[index].intialBalance = balance.intialBalance;
        let stakedAmount = participants[index].stakedAmount
          ? Number(participants[index].stakedAmount)
          : 0;
        let totalStakedAmount = stakedAmount + Number(balance.intialBalance);
        participants[index].totalStakedAmount = totalStakedAmount.toString();
      }
    });
    return participants;
  },

  async getIntialBalance(currencyAddressesByNetwork, stakingContractAddress) {
    let filter = { currencyAddressesByNetwork };
    result = await db.TokenHoldersCurrencyAddressesByNetwork.find(filter);
    if (result.length == 0) {
      result = await db.TokenHoldersCurrencyAddressesByNetworkSnapShot.find(
        filter
      );
    }
    if (result.length > 0) {
      result = result.map((item) => {
        let stakedAmount = Web3.utils.fromWei(
          item.tokenHolderQuantity,
          "ether"
        );
        return {
          currencyAddressesByNetwork,
          stakingContractAddress,
          tokenContractAddress: item.tokenContractAddress,
          stakeHolderWalletAddress: item.tokenHolderAddress,
          intialBalance: stakedAmount,
          totalStakedAmount: stakedAmount,
        };
      });
    }
    return result;
  },
};
