var axios = require("axios").default;

module.exports = {

  async doWithdrawSigned(req: any, swapAndWithdrawTransactionObject: any, token: any) {
    try {
      const config = {
        headers:{
          Authorization: await withdrawTransactionHelper.fiberAuthorizationToken()
        }
      };
      let baseUrl = ((global as any) as any).environment.baseUrlFIBEREngineBackend;
      let url = `${baseUrl}/multiswap/withdraw/signed?swapTransactionHash=${swapAndWithdrawTransactionObject.receiveTransactionId}&sourceAmount=${swapAndWithdrawTransactionObject.sourceAmount}&sourceNetworkChainId=${req.sourceNetwork.chainId}&destinationNetworkChainId=${req.destinationNetwork.chainId}&sourceTokenContractAddress=${swapAndWithdrawTransactionObject.sourceCabn.tokenContractAddress}&destinationTokenContractAddress=${swapAndWithdrawTransactionObject.destinationCabn.tokenContractAddress}&sourceWalletAddress=${swapAndWithdrawTransactionObject.sourceWalletAddress}&destinationWalletAddress=${swapAndWithdrawTransactionObject.destinationWalletAddress}`;
      console.log('doSwapAndWithdraw doWithdrawSigned url',url);
      let res = await axios.get(url, config);
      if(res.data.body && res.data.body.data){
        console.log('doSwapAndWithdraw doWithdrawSigned hash',res.data.body.data);
        return res.data.body;
      }
    } catch (error: any) {
      console.log(error.data);
    }
    return null;
  }

};
