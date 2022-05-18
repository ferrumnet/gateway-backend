const axios = require("axios").default;
var Web3 = require('web3');
const { Big } =  require("big.js");

module.exports = {
  async queryByCABN(cabn, startBlock, endBlock) {
    try {
      const res = await axios.get(`https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${cabn}&page=1&offset=10000&startblock=${startBlock}&endblock=${endBlock}&sort=asc&apikey=${global.environment.bscscanApikeyForCompetition}`);
      return res.data.result ? res.data.result : [];
    } catch (error) {
      console.log(error);
    }
  },

  async queryStakingInfo(address,token){
    const res = await axios.post(`https://imqx88xczt.us-east-2.awsapprunner.com/`, {
      command: 'stakeInfo',
      data: { 
        network:'BSC', 
        stakeType:'openEnded', 
        stakeId:token,
        stakingAddress:address
       },
      params: []
    });
    if(res.data){
      return Number(res.data.stakedBalance)
    }
    return 0
  },

  async queryContract(address,currency){

    const data = await axios.get(`https://api.bscscan.com/api?module=contract&action=getabi&address=${address}&apikey=${global.environment.bscscanApikeyForCompetition}`);
    
    var contractABI = "";

    contractABI = JSON.parse(data.data.result);
    
    if (contractABI != '') {
      
      var web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed1.binance.org:443'));

      var ApeContract = new web3.eth.Contract(contractABI,"0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7");

      const response = await ApeContract.methods.getAmountsOut("1000000000000000000", [currency, "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"]).call() 

      if (response.length > 0) { 

        return new Big(response[2]).div(10 ** 18).toFixed();
      
      }  

    } else {
        console.log("Error");
    }
  },

  async queryStakingContract(address,currency){

    const data = await axios.get(`https://api.bscscan.com/api?module=contract&action=getabi&address=${address}&apikey=${global.environment.bscscanApikeyForCompetition}`);
    
    var contractABI = "";

    contractABI = JSON.parse(data.data.result);
    
    if (contractABI != '') {
      
      var web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed1.binance.org:443'));

      var ApeContract = new web3.eth.Contract(contractABI,"0xD87F304CA205Fb104dc014696227742d20C8F10a");

      const response = await ApeContract.methods.stakedBalance(currency).call() 

      if(response){
        return Web3.utils.fromWei(response||0,'ether')
      }

    } else {
        console.log("Error");
    }
  },


  async queryByCABNAndToken(tokenContractAddress,cabn, startBlock, endBlock){
    try {
      
      const res = await axios.get(`https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${tokenContractAddress}&address=${cabn}&startblock=${startBlock}k&endblock=${endBlock}&sort=asc&apikey=${global.environment.bscscanApikeyForCompetition}`)
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
