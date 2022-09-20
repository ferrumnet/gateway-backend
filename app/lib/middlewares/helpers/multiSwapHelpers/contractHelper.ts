import Web3 from 'web3';
var { Big } = require("big.js");

module.exports = {

  async getCurrentAllowance(address: any, network: any, cabn: any, contractAddress: string) {

    if (address.address && network.rpcUrl && cabn.tokenContractAddress && contractAddress) {

      let allowance = await web3ConfigurationHelper.erc20(network.rpcUrl, cabn.tokenContractAddress).methods.allowance(address.address, contractAddress).call();
      if (allowance) {
        const bAllownace = new Big(allowance.toString());
        return bAllownace;
      }
    }
    return null;
  },

  async approveAllocation(address: any, network: any, cabn: any, contractAddress: string, value: any, approveeName: 'the given contract') {
    let result = [];
    let useMax = true;
    if (address.address && network.rpcUrl && cabn.currency && cabn.currency.symbol && cabn.tokenContractAddress && contractAddress && value) {
      let tokDecimalFactor = 10 ** (await swapUtilsHelper.decimals(network, cabn));
      let amount = new Big(value).times(new Big(tokDecimalFactor));
      let nonce = await web3Helper.getTransactionsCount(network, address);
      const amountHuman = amount.div(tokDecimalFactor).toString();
      let symbol = cabn.currency.symbol;
      // let tokenCon = await web3ConfigurationHelper.erc20(network.rpcUrl, cabn.tokenContractAddress)
      // console.log(await tokenCon.methods.symbol().call());

      let currentAllowance = await this.getCurrentAllowance(address, network, cabn, contractAddress);

      if (currentAllowance.lt(amount)) {

        let approveGasOverwite: number = 0;
        if (currentAllowance.gt(new Big(0))) {
          let [approveToZero, approveToZeroGas] = await web3Helper.approveToZero(network, cabn,
            address, contractAddress);

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

  async doSwapAndGetTransactionPayload(address: any, fromNetwork: any, fromCabn: any, contractAddress: string, amountValue: any, toNetwork: any, toCabn: any, isForGasEstimation: boolean) {
    let approveeName = 'TokenBridgePool';

    if (!isForGasEstimation) {
      let apporveAllocationResult = await this.approveAllocation(address, fromNetwork, fromCabn, contractAddress, amountValue, approveeName);

      if (apporveAllocationResult && apporveAllocationResult.length) {
        return standardStatuses.status200({ isAlreadyApproved: false, result: apporveAllocationResult });
      }
    }

    let userBalance = await web3Helper.getUserBalance(fromNetwork, fromCabn, address);
    let balance = await swapUtilsHelper.amountToHuman_(fromNetwork, fromCabn, userBalance);

    if (new Big(balance).lt(new Big(amountValue))) {
      return standardStatuses.status400(`Not enough balance. ${amountValue} is required but there is only ${balance} available`);
    }

    let response = await this.swap(address, fromNetwork, fromCabn, contractAddress, amountValue, toNetwork, toCabn);

    // try {
    //   await this.runLiquidityCheckScript(targetCurrency);
    // } catch (e) {
    //   console.error('Error running runLiquidityCheckScript', e as Error);
    // }
    console.log('isForGasEstimation', isForGasEstimation);
    if (isForGasEstimation) {
      return standardStatuses.status200(response.gas);
    }

    return standardStatuses.status200({ isAlreadyApproved: true, result: response });
  },

  async swap(address: any, fromNetwork: any, fromCabn: any, contractAddress: string, amountValue: any, toNetwork: any, toCabn: any) {

    let amountRaw = await swapUtilsHelper.amountToMachine(fromNetwork, fromCabn, amountValue);
    let swapResponse = web3ConfigurationHelper.bridgePool(fromNetwork.rpcUrl, contractAddress).methods.swap(fromCabn.tokenContractAddress, amountRaw, 4, toCabn.tokenContractAddress);
    let gas = await swapUtilsHelper.estimateGasOrDefault(swapResponse, address.address, null);
    let nonce = await web3Helper.getTransactionsCount(fromNetwork, address);

    let gasLimit = gas ? gas.toFixed() : undefined;

    return {
      // fromCabn,
      // address,
      amount: '0',
      contract: contractAddress,
      data: swapResponse.encodeABI(),
      gas: { gasPrice: '0', gasLimit },
      nonce,
      description: `Swap `,
    };

  },

  async withdrawSigned(address: any, w: any, smartContractAddress: any) {
    
    let destinationNetwork = w.destinationNetwork;
    console.log(w.payBySig.signatures[0].signature)
    const swapResponse = web3ConfigurationHelper.bridgePool(destinationNetwork.rpcUrl, smartContractAddress).methods.withdrawSigned(w.payBySig.token, w.payBySig.payee,
      w.payBySig.amount,
      (w.payBySig as any).salt || w.payBySig.swapTxId, // Backward compatibility with older data
      swapUtilsHelper.add0x((w.payBySig.signatures[0].signature || ''))
    );
    let gas = await swapUtilsHelper.estimateGasOrDefault(swapResponse, address.address, null);
    let nonce = await web3Helper.getTransactionsCount(destinationNetwork, address);
    let gasLimit = gas ? gas.toFixed() : undefined;

    console.log(swapResponse)
    console.log(gas)
    console.log(nonce)

    return {
      contractAddress: smartContractAddress,
      currency: w.sendCurrency,
      from: address.address,
      data: swapResponse.encodeABI(),
      gas: { gasPrice: '0', gasLimit },
      nonce,
      description: `Withdraw `,
    };
  }

}
