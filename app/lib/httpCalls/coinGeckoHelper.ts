var axios = require("axios").default;

module.exports = {
 // 
  async getTokensUSDValues(coingeckoTokenIds: any) {
    //coingeckoTokenIds = ferrum-network,frmx-token
    try {
      const res = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coingeckoTokenIds.toString()}`);
      return res.data ? res.data : [];
    } catch (error) {
      console.log(error);
    }
  },
};
