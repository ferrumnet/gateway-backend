var axios = require("axios").default;

module.exports = {
  async createJobBySwapHash(
    req: any,
    swapAndWithdrawTransactionObject: any,
    token: any
  ) {
    try {
      let baseUrl = (global as any as any).environment
        .baseUrlMultiswapNodeBackend;
      if ((global as any as any).utils.IS_LOCAL_ENV) {
        baseUrl = "http://localhost:3000";
      }
      let url = `${baseUrl}/api/jobs`;
      console.log("doSwapAndWithdraw createJobBySwapHash url", url);
      let body: any = {};
      body.name = "transactionReceipt";
      body.sourceRpcURL = req.sourceNetwork.rpcUrl;
      body.isSourceNonEVM = req.sourceNetwork.isNonEVM;
      body.destinationRpcURL = req.destinationNetwork.rpcUrl;
      body.isDestinationNonEVM = req.destinationNetwork.isNonEVM;
      body.sourceBridgeAmount =
        swapAndWithdrawTransactionObject.sourceBridgeAmount;
      body.destinationBridgeAmount =
        swapAndWithdrawTransactionObject.destinationBridgeAmount;
      body.txId = swapAndWithdrawTransactionObject.receiveTransactionId;
      console.log("doSwapAndWithdraw createJobBySwapHash body", body);
      let res = await axios.post(url, body);
      if (res.data && res.data.jobId) {
        console.log("doSwapAndWithdraw createJobBySwapHash response", res.data);
        return res.data.jobId;
      }
    } catch (error) {
      console.log(error);
    }
    return null;
  },
};
