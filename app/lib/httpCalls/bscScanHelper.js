const axios = require("axios").default;

module.exports = {
  async queryByCABN(cabn, startBlock, endBlock) {
    try {
      const res = await axios.get(`https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${cabn}&page=1&offset=10000&startblock=${startBlock}&endblock=${endBlock}&sort=asc&apikey=${global.environment.bscscanApikeyForCompetition}`);
      return res.data.result ? res.data.result : [];
    } catch (error) {
      console.log(error);
    }
  },

  async queryBlockNumber(timestamp) {
    try {
      const res = await axios.get(`https://api.bscscan.com/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${global.environment.bscscanApikeyForCompetition}`);
      return res.data.result ? res.data.result : [];
    } catch (err) {
      console.error(err);
    }
  },
};
