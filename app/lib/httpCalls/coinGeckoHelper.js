const axios = require("axios").default;
var Web3 = require('web3');
const { Big } =  require("big.js");

module.exports = {
 // 
  async getTokensUSDValues(coingeckoTokenIds) {
    //coingeckoTokenIds = ferrum-network,frmx-token
    try {
      const res = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coingeckoTokenIds.toString()}`);
      return res.data ? res.data : [];
    } catch (error) {
      console.log(error);
    }
  },
};
