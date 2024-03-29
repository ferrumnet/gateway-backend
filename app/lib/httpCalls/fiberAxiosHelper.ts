var axios = require("axios").default;

module.exports = {
  async doWithdrawSigned(
    req: any,
    swapAndWithdrawTransactionObject: any,
    token: any
  ) {
    try {
      const config = {
        headers: {
          Authorization:
            await withdrawTransactionHelper.fiberAuthorizationToken(),
        },
      };
      let baseUrl = (global as any as any).environment
        .baseUrlFIBEREngineBackend;
      let url = `${baseUrl}/v2/multiswap/withdraw/signed/${swapAndWithdrawTransactionObject.receiveTransactionId}`;
      console.log("doSwapAndWithdraw doWithdrawSigned url", url);
      let res = await axios.post(
        url,
        this.getWithdrawBody(swapAndWithdrawTransactionObject),
        config
      );
      if (res.data.body && res.data.body.data) {
        console.log(
          "doSwapAndWithdraw doWithdrawSigned hash",
          res.data.body.data
        );
        return res.data.body;
      }
    } catch (error: any) {
      console.log(error.data);
    }
    return null;
  },

  async getTokenQuoteInformation(req: any) {
    try {
      const config = {
        headers: {
          Authorization:
            await withdrawTransactionHelper.fiberAuthorizationToken(),
        },
      };
      let baseUrl = (global as any as any).environment
        .baseUrlFIBEREngineBackend;
      let url = `${baseUrl}/v1/multiswap/token/categorized/quote/info?sourceAmount=${req.query.sourceAmount}&sourceNetworkChainId=${req.query.sourceNetwork}&destinationNetworkChainId=${req.query.destinationNetwork}&sourceTokenContractAddress=${req.query.sourceCabn}&destinationTokenContractAddress=${req.query.destinationCabn}`;
      console.log("getTokenQuoteInformation url", url);
      let res = await axios.get(url, config);
      if (res.data.body) {
        console.log("getTokenQuoteInformation response", res.data.body);
        return res.data.body;
      }
    } catch (error: any) {
      console.log(error.data);
    }
    return null;
  },

  getWithdrawBody(model: any) {
    let body: any = {};
    body.sourceAmount = model.sourceAmount;
    body.sourceNetworkChainId = model.sourceNetwork.chainId;
    body.sourceTokenContractAddress = model.sourceCabn.tokenContractAddress;
    body.sourceWalletAddress = model.sourceWalletAddress;
    body.destinationNetworkChainId = model.destinationNetwork.chainId;
    body.destinationTokenContractAddress =
      model.destinationCabn.tokenContractAddress;
    body.destinationWalletAddress = model.destinationWalletAddress;
    body.salt = model.payBySig.salt;
    body.hash = model.payBySig.hash;
    body.signatures = model.payBySig.signatures;
    body.bridgeAmount = model.bridgeAmount;

    console.log("getWithdrawBody body", body);
    return body;
  },
};
