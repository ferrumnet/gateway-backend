import Web3 from 'web3';
var { Big } = require("big.js");

module.exports = {

  async getCurrentAllowance(address: any, network: any, cabn: any, contractAddress: string) {

    if (address.address && network.rpcUrl && cabn.tokenContractAddress && contractAddress) {

      let allowance = await web3ConfigurationHelper.erc20(network.rpcUrl, cabn.tokenContractAddress).methods.allowance(address.address, contractAddress).call();
      console.log('allowance' + allowance);
      if (allowance) {
        const bAllownace = new Big(allowance.toString());
        console.log('current allowance is ', bAllownace.toString(), ' for ', contractAddress, 'from', address.address);
        return bAllownace;
      }
    }
    return null;
  },

  async approveAllocation(address: any, network: any, cabn: any, contractAddress: string, value: any, approveeName: 'the given contract') {
    let result = [];
    let useMax = true;
    if (address.address && network.rpcUrl && cabn.currency && cabn.currency.symbol && cabn.tokenContractAddress && contractAddress && value) {
      let tokDecimalFactor = 10 ** (await web3Helper.decimals(network, cabn));
      let amount = new Big(value).times(new Big(tokDecimalFactor));
      let nonce = await web3Helper.getTransactionsCount(network, address);
      console.log(nonce)
      const amountHuman = amount.div(tokDecimalFactor).toString();
      console.log(amountHuman)
      let symbol = cabn.currency.symbol;
      // let tokenCon = await web3ConfigurationHelper.erc20(network.rpcUrl, cabn.tokenContractAddress)
      // console.log(await tokenCon.methods.symbol().call());

      let currentAllowance = await this.getCurrentAllowance(address, network, cabn, contractAddress);

      if (currentAllowance.lt(amount)) {

        let approveGasOverwite: number = 0;
        if (currentAllowance.gt(new Big(0))) {
          let [approveToZero, approveToZeroGas] = await web3Helper.approveToZero(network, cabn,
            address, contractAddress);
          console.log(approveToZero, approveToZeroGas);

          result.push(this.createObjectForApproveAllocation(contractAddress, cabn, address, approveToZero,
            approveToZeroGas.toString(), nonce,
            `Zero out the approval for ${symbol} by ${approveeName}`))
          nonce++;
          approveGasOverwite = approveToZeroGas;

        }

        let [approve, approveGas] = useMax ? await web3Helper.approveMax(network, cabn,
          address, contractAddress, approveGasOverwite) :
          await web3Helper.approve(network, cabn,
            address, contractAddress, approveGasOverwite, amount);

        result.push(
          this.createObjectForApproveAllocation(contractAddress, cabn, address, approve, approveGas.toString(), nonce,
            `Approve ${useMax ? 'max' : amountHuman} ${symbol} to be spent by ${approveeName}`)
        );
        nonce++;

      }
    }

    return result;
  },

  createObjectForApproveAllocation(contractAddress: string, cabn: string, address: string, data: string, gasLimit: string, nonce: number, description: string) {
    return {
      cabn,
      address,
      amount: '0',
      contractAddress,
      data,
      gas: { gasPrice: '0', gasLimit },
      nonce,
      description,
    };
  },

  async doSwapAndGetTransactionPayload(address: any, fromNetwork: any, fromCabn: any, contractAddress: string, amountValue: any, toNetwork: any, toCabn: any, res: any) {
    let approveeName = 'TokenBridgePool';
    let apporveAllocationResult = await this.approveAllocation(address, fromNetwork, fromCabn, contractAddress, amountValue, approveeName);

    if (apporveAllocationResult && apporveAllocationResult.length) {
      return res.http200({
        data: { isAlreadyApproved: false, result: apporveAllocationResult }
      });
    }

    let userBalance = await web3Helper.getUserBalance(fromNetwork, fromCabn, address);
    let balance = await web3Helper.amountToHuman_(fromNetwork, fromCabn, userBalance);
    console.log(balance)

    if (new Big(balance).gte(new Big(amountValue))) {
      // change this error message
      return res.http400(`Not enough balance. ${amountValue} is required but there is only ${balance} available`);
    }

    let response = await this.swap(address, fromNetwork, fromCabn, contractAddress, amountValue, toNetwork, toCabn, res);

    // try {
    //   await this.runLiquidityCheckScript(targetCurrency);
    // } catch (e) {
    //   console.error('Error running runLiquidityCheckScript', e as Error);
    // }

    return res.http200({
      data: { isAlreadyApproved: true, result: response }
    });
  },

  async swap(address: any, fromNetwork: any, fromCabn: any, contractAddress: string, amountValue: any, toNetwork: any, toCabn: any, res: any) {

    let amountRaw = await web3Helper.amountToMachine(fromNetwork, fromCabn, amountValue);
    console.log(amountRaw);
    let swapResponse = (web3ConfigurationHelper.bridgePool(fromNetwork.rpcUrl, contractAddress)).methods.swap(fromCabn.tokenContractAddress, amountRaw, toNetwork.chainId, toNetwork.networkShortName).call();
    console.log('swapResponse' + swapResponse);
    let gas = await this.estimateGasOrDefault(swapResponse, address.address, null);
    console.log('gas' + gas);
    let nonce = await web3Helper.getTransactionsCount(fromNetwork, address);
    console.log('nonce' + nonce);

    let gasLimit = gas ? gas.toFixed() : undefined;

    return {
      fromCabn,
      address,
      amount: '0',
      contract: contractAddress,
      data: swapResponse.encodeABI(),
      gas: { gasPrice: '0', gasLimit },
      nonce,
      description: `Swap`,
    };

  },

  async estimateGasOrDefault(method: any, from: string, defaultGas?: number) {
    try {
      return await method.estimateGas({ from });
    } catch (e) {
      console.info('Error estimating gas. Tx might be reverting..');
      return defaultGas;
    }
  }

}
