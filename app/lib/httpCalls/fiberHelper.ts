var axios = require("axios").default;

module.exports = {

  async doWithdrawSigned(req: any, swapAndWithdrawTransactionObject: any, token: any) {
    try {
      const config = {
        headers:{
          Authorization: withdrawTransactionHelper.fiberAuthorizationToken()
        }
      };
      let baseUrl = ((global as any) as any).environment.baseUrlFIBEREngineBackend;
      let url = `${baseUrl}/multiswap/withdraw/signed?sourceNetworkChainId=${req.sourceNetwork.chainId}&swapTransactionHash=${swapAndWithdrawTransactionObject.receiveTransactionId}`;
      console.log('doSwapAndWithdraw doWithdrawSigned url',url);
      let res = await axios.get(url, config);
      if(res.data.body && res.data.body.data){
        console.log('doSwapAndWithdraw doWithdrawSigned hash',res.data.body.data);
        return res.data.body.data;
      }
    } catch (error) {
      console.log(error);
    }
    return null;
  }

};
