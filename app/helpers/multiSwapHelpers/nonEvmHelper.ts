const { SigningCosmWasmClient } = require("@cosmjs/cosmwasm-stargate");

module.exports = {

    async getTransactionReceiptByTxIdUsingCosmWasm(network: any, txId: any) {
        let receipt = await this.getTransactionByHash(txId, network.rpcUrl);
        if (!receipt) {
            // need to move this error in phrase
            return standardStatuses.status400(`Transaction "${txId}" is invalid`);
        }

        if (!receipt.status) {
            // need to move this error in phrase
            return standardStatuses.status400(`Transaction "${txId}" is failed`);
        }
        return swapTransactionHelper.parseSwapEvent(txId, receipt);
    },

    async swapTransactionSummary(fromNetwork: any, swap: any, req: any) {
        if (req.query.sourceWalletAddress) {
            req.query.sourceWalletAddress = (req.query.sourceWalletAddress).toLowerCase();
        }
        if (req.query.destinationWalletAddress) {
            req.query.destinationWalletAddress = (req.query.destinationWalletAddress).toLowerCase();
        }else {
            req.query.destinationWalletAddress = req.query.sourceWalletAddress;
        }
        let newItem = {
          timestamp: new Date().valueOf(),
          receiveTransactionId: swap.transactionId,
          sourceTimestamp: 0,
          status: swap.status,
          useTransactions: [],
          execution: { status: '', transactions: [] },
          v: 0,
          signatures: 0,
          sourceAmount: req.query.sourceAmount,
          sourceWalletAddress: req.query.sourceWalletAddress,
          destinationWalletAddress: req.query.destinationWalletAddress
        }
        return newItem;
    },

    async withdrawTransactionSummary(receipt: any, req: any) {
        receipt.status = !!receipt.status ? utils.swapAndWithdrawTransactionStatuses.swapWithdrawCompleted : utils.swapAndWithdrawTransactionStatuses.swapWithdrawFailed
        receipt.destinationAmount = req?.body?.destinationAmount;
        return receipt;
    },

    async getTransactionByHash(hash: any, rpc: any) {
        let client = await SigningCosmWasmClient.connectWithSigner(rpc);
        let txResp = await client.getTx(hash);
        txResp.status = false;
        if (txResp && txResp.code == 0) {
            txResp.status = true;
        }
        return txResp;
    }

}