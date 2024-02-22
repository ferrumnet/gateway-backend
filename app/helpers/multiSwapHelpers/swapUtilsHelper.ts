var { Big } = require("big.js");

module.exports = {
  async amountToHuman(amount: string, decimal: number) {
    const decimalFactor = 10 ** decimal;
    return new Big(amount).div(decimalFactor).toFixed();
  },

  async amountToMachine(network: any, cabn: any, amount: number) {
    let decimal = await this.decimals(network, cabn);
    let decimalFactor = 10 ** decimal;
    return new Big(amount).times(decimalFactor).toFixed(0);
  },

  async amountToHuman_(network: any, cabn: any, amount: number) {
    let decimal = await this.decimals(network, cabn);
    if (decimal) {
      let decimalFactor = 10 ** decimal;
      return new Big(amount).div(decimalFactor).toFixed();
    }

    return null;
  },

  async decimals(network: any, cabn: any) {
    if (network.rpcUrl && cabn.tokenContractAddress) {
      let con = web3ConfigurationHelper.erc20(
        network.rpcUrl,
        cabn.tokenContractAddress
      );
      if (con) {
        return await con.methods.decimals().call();
      }
    }

    return null;
  },
};
