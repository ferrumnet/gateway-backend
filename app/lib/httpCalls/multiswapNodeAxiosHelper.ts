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
      let url = `${baseUrl}/api/jobs`;
      console.log("doSwapAndWithdraw createJobBySwapHash url", url);
      let body: any = {};
      body.name = "transactionReceipt";
      body.sourceRpcURL = req.sourceNetwork.rpcUrl;
      body.isSourceNonEVM = req.sourceNetwork.isNonEVM;
      body.destinationRpcURL = req.destinationNetwork.rpcUrl;
      body.isDestinationNonEVM = req.destinationNetwork.isNonEVM;
      body.bridgeAmount = swapAndWithdrawTransactionObject.bridgeAmount;
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

  async createGeneratorJobBySwapHash(swapAndWithdrawTransactionObject: any) {
    try {
      let url = await nodeConfigurationsHelper.getNodeUrl(
        utils.nodeTypes.generator
      );
      let config = {
        headers: {
          Authorization:
            "Bearer " +
            nodeAuthHelper.createAuthToken(
              (global as any).environment.generatorNodeApiKey
            ),
        },
      };
      console.log("doSwapAndWithdraw createGeneratorJobBySwapHash url", url);
      let body: any = {};
      body.transaction = swapAndWithdrawTransactionObject;
      let res = await axios.post(url, body, config);
      if (res.data) {
        console.log(
          "doSwapAndWithdraw createGeneratorJobBySwapHash response",
          res.data
        );
        return true;
      }
    } catch (error) {
      console.log(error);
    }
    return false;
  },

  async createMasterJobBySwapHash(swapAndWithdrawTransactionObject: any) {
    try {
      let url = await nodeConfigurationsHelper.getNodeUrl(
        utils.nodeTypes.master
      );
      let config = {
        headers: {
          Authorization:
            "Bearer " +
            nodeAuthHelper.createAuthToken(
              (global as any).environment.masterNodeApiKey
            ),
        },
      };
      console.log("doSwapAndWithdraw createMasterJobBySwapHash url", url);
      let body: any = {};
      body.transaction = swapAndWithdrawTransactionObject;
      let res = await axios.post(url, body, config);
      if (res.data) {
        console.log(
          "doSwapAndWithdraw createMasterJobBySwapHash response",
          res.data
        );
        return true;
      }
    } catch (error) {
      console.log(error);
    }
    return false;
  },

  async createValidatorJobsBySwapHash(swapAndWithdrawTransactionObject: any) {
    try {
      let urls = await nodeConfigurationsHelper.getValidatorNodeUrls();
      let config = {
        headers: {
          Authorization:
            "Bearer " +
            nodeAuthHelper.createAuthToken(
              (global as any).environment.validatorNodeApiKey
            ),
        },
      };
      if (urls && urls.length > 0) {
        for (let url of urls) {
          console.log(
            "doSwapAndWithdraw createValidatorJobsBySwapHash url",
            url
          );
          let body: any = {};
          body.transaction = swapAndWithdrawTransactionObject;
          let res = await axios.post(url, body, config);
          if (res.data) {
            console.log(
              "doSwapAndWithdraw createValidatorJobsBySwapHash response",
              res.data
            );
          }
        }
      }
      return true;
    } catch (error) {
      console.log(error);
    }
    return false;
  },
};
