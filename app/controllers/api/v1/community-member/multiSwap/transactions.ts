var mongoose = require('mongoose');

module.exports = function (router: any) {

  router.post('/create/:txId', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let fromNetwork = null;

    if (!req.params.txId && !req.query.fromNetworkId) {
      return res.http400('txId & fromNetworkId are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.fromNetworkId)) {
      return res.http400('Invalid fromNetworkId');
    }

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id });
    }

    fromNetwork = await db.Networks.findOne({ _id: req.query.fromNetworkId });

    if (address && fromNetwork) {
      req.query.bridgeContractAddress = fromNetwork.contractAddress;
      let transactionResponse = await swapTransactionHelper.getTransactionReceiptByTxIdUsingWeb3(fromNetwork, req.params.txId, req.query.bridgeContractAddress);
      if (transactionResponse && transactionResponse.code == 400) {
        return res.http400(await commonFunctions.getValueFromStringsPhrase(transactionResponse.data), transactionResponse.data);
      } else if (transactionResponse && transactionResponse.code == 401) {
        return res.http400('Invalid txId or fromNetworkId');
      }
      let swap = transactionResponse.data;
      let swapTransaction = null;
      // console.log('swap', swap);
      if (swap) {
        swapTransaction = await swapTransactionHelper.swapTransactionHelper(swap, utils.expectedSchemaVersionV1_0);
      }
      // console.log('swapTransaction', swapTransaction);
      // let hash = signatureHelper.bridgeHashV1_0(swapTransaction, swap);
      // console.log('final hash', hash);
      // let msgHash = hash.replace('0x', '');
      // let signatureResponse = await ecdsaHelper.sign('915c8bf73c84c0482beef48bb4bf782892d38d57d3c9af32de6af27a54d12c5a', msgHash);
      // console.log(signatureResponse);
      // let withdrawSigned = await contractHelper.withdrawSigned(address, swapTransaction, swap.toNetwork, '0x544db7e44d73761c00cfc4525c38f896bd20b69fb8487ba12f2a21af013502d565d02ade27351679f16c832cc1eaf6202a831ad2ecec47fbf2fbfe4a70bafcb11c');
      // console.log(withdrawSigned);
      return res.http200({
        transaction: transactionResponse,
        swapTransaction: swapTransaction
      })
    } else {
      return res.http400('Invalid txId or fromNetworkId');
    }

  }));

};
