const axios = require("axios").default;
const apikey = global.dockerEnvironment.bscscanApikeyForCompetition;

module.exports = {
  async queryByCABN(cabn, startBlock, endBlock) {
    try {    
      const res = await axios.get(`https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${cabn}&page=1&offset=10000&startblock=${startBlock}&endblock=${endBlock}&sort=asc&apikey=${apikey}`);
      return res.data.result ? res.data.result : [];
    } catch (error) {
      console.log(error);
    }
  },

  async queryBlockNumber(timestamp) {
    try {
      const res = await axios.get(`https://api.bscscan.com/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${apikey}`);
      return res.data.result ? res.data.result : [];
    } catch (err) {
      console.error(err);
    }
  },
};
