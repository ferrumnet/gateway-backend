// import Web3 from 'web3';
var Web3 = require('web3');
import { AbiItem } from 'web3-utils';
import erc20Abi from '../../../../../resources/IERC20.json';
import bridgeAbi from '../../../../../resources/BridgePool.json';

module.exports = {

  web3(rpcUrl: string) {

    if (rpcUrl) {
      return new Web3(new Web3.providers.HttpProvider(rpcUrl));
    }
    return null;
  },

  erc20(rpcUrl: string, tokenContractAddress: string) {
    let web3 = this.web3(rpcUrl).eth;
    return new web3.Contract(erc20Abi as any, tokenContractAddress);
  },

  bridgePool(rpcUrl: string, tokenContractAddress: string) {
    let web3 = this.web3(rpcUrl).eth;
    console.log(bridgeAbi.abi)
    return new web3.Contract(bridgeAbi.abi as AbiItem[], tokenContractAddress);
  }

}
