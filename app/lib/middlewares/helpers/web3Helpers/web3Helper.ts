import Web3 from 'web3';
var { Big } = require("big.js");
import { AbiItem } from 'web3-utils';
import ApeRouterJson from '../../../../../resources/ApeRouterAbi.json'

let tokenFRMBSCMainnet = "0xa719b8ab7ea7af0ddb4358719a34631bb79d15dc";
let tokenFRMxBSCMainnet = "0x8523518001ad5d24b2a04e8729743c0643a316c0";
let tokenUSDCBSCMainnet = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";

let cFRMxTokenContractAddress = "0x1fC45F358D5292bEE1e055BA7CebE4d4100972AE";
let cFRMTokenContractAddress = "0xaf329a957653675613D0D98f49fc93326AeB36Fc";
let APELPCFRMBNBTokenContractAddress = "0x9aa0AB73409311984ED84f3Edef962201Bd11712";
let APELPCFRMxBNBTokenContractAddress = "0xb76b11410A506495418D20c58F9452c17CF285c1";

module.exports = {

  async currentAllowance(address: any, network: any, cabn: any, contractAddress: string) {

    if (address.address && network.rpcUrl && cabn.tokenContractAddress && contractAddress) {

      let allowance = await web3ConfigurationHelper.erc20(network.rpcUrl, cabn.tokenContractAddress).methods.allowance(address.address, contractAddress).call();
      console.log('allowance'+allowance);
      if (allowance) {
        const bAllownace = new Big(allowance.toString());
        console.log('current allowance is ', bAllownace.toString(), ' for ', contractAddress, 'from', address.address);
        return bAllownace;
      }
    }
    return null;
  },

  async getTransactionUsingWeb3(network: any, txId: any) {
    let web3 = web3ConfigurationHelper.web3(network.rpcUrl).eth;
    if (web3) {
      let transaction = await web3.getTransaction(txId)
      return transaction;
    }
    return null;
  },

  async getTokenPriceFromRouter(currency: any, network: any) {
    try {
      let web3 = (await web3ConfigurationHelper.web3(network.rpcUrl)).eth;

      let ApeContract = new web3.Contract(ApeRouterJson.abi as AbiItem[],
        "0x10ED43C718714eb63d5aA57B78B54704E256024E"
      );

      let pricingRoute = [currency, "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"];
      if (currency.toLowerCase() === cFRMxTokenContractAddress.toLowerCase()) {
        pricingRoute = [currency, "0x8523518001ad5d24b2a04e8729743c0643a316c0", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"]
      } else if (currency.toLowerCase() === cFRMTokenContractAddress.toLowerCase()) {
        pricingRoute = [currency, "0xA719b8aB7EA7AF0DDb4358719a34631bb79d15Dc", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"]
      }
      let response = await ApeContract.methods.getAmountsOut(
        "1000000000000000000", pricingRoute
      ).call()

      if (response.length > 0) {
        return await this.amountToHuman(response[response.length - 1], 18)
      }
      return 0
    } catch (e) {
      // console.log(e)
    }
  },

  async getFeesUsingWeb3(network: any) {

    let tokens: any = [
      {
        token: "FRM",
        currency: tokenFRMBSCMainnet,
      },
      {
        token: "FRMx",
        currency: tokenFRMxBSCMainnet,
      },
      // {
      //   token: "cFRM-BNB",
      //   currency: APELPCFRMBNBTokenContractAddress,
      // },
      // {
      //   token: "cFRMx-BNB",
      //   currency: APELPCFRMxBNBTokenContractAddress,
      // },
      {
        token: "cFRM",
        currency: cFRMTokenContractAddress,
      },
      {
        token: "cFRMx",
        currency: cFRMxTokenContractAddress,
      },
    ];

    let i = 0;
    for (let item of tokens) {
      // if (item.token === ‘FRM’ || item.token === ‘cFRM’ || item.token === ‘FRMx’ || item.token === ‘cFRMx’) {
      //   exchangeToken(item);
      // }
      //faizan step 1
      console.log(item.currency)
      let priceDetails = await this.getTokenPriceFromRouter(item.currency, network);
      console.log(item.token + '::::::' + priceDetails)
      tokens[i].value = priceDetails;
      i += 1;
    }

    return tokens;
  },

  async amountToHuman(amount: string, decimal: number) {
    const decimalFactor = 10 ** decimal;
    return new Big(amount).div(decimalFactor).toFixed();
  },

  async amountToHuman_(network: any, cabn: any, amount: number) {
    let decimal = await this.decimals(network, cabn);
    if(decimal){
      let decimalFactor = 10 ** decimal;
      return new Big(amount).div(decimalFactor).toFixed();
    }

    return null;
  },

  async decimals(network: any, cabn: any) {

    if (network.rpcUrl && cabn.tokenContractAddress) {

      let con = web3ConfigurationHelper.erc20(network.rpcUrl, cabn.tokenContractAddress)
      if (con) {
        return await con.methods.decimals().call();
      }

    }

    return null;
  }

}
