var axios = require("axios").default;

module.exports = {

  async createJobBySwapHash(req: any, swapAndWithdrawTransactionObject: any, token: any) {
    try {
      let baseUrl = ((global as any) as any).environment.baseUrlMultiswapNodeBackend;
      let url = `${baseUrl}/jobs`;
      console.log('doSwapAndWithdraw createJobBySwapHash url',url);
      let body: any = {};
      body.name = 'transactionReceipt';
      body.rpcURL = req.sourceNetwork.rpcUrl;
      body.txId = swapAndWithdrawTransactionObject.receiveTransactionId;
      console.log('doSwapAndWithdraw createJobBySwapHash body',body);
      let res = await axios.post(url, body);
      if(res.data && res.data.jobId){
        console.log('doSwapAndWithdraw createJobBySwapHash response',res.data);
        return res.data.jobId;
      }
    } catch (error) {
      console.log(error);
    }
    return null;
  }

};
