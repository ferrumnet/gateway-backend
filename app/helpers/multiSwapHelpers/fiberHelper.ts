export const handleFiberRequest = async (data: any, swapTxHash: string) => {
  try {
    let transaction = await db.SwapAndWithdrawTransactions.findOne({
      receiveTransactionId: swapTxHash,
    });

    if (!transaction) {
      throw "Invalid operation";
    }

    let useTransaction = {
      transactionId: data.data,
      status: utils.swapAndWithdrawTransactionStatuses.swapWithdrawCompleted,
      timestamp: new Date(),
    };

    if (data?.responseCode == 200) {
      if (
        transaction.withdrawTransactions &&
        transaction.withdrawTransactions.length > 0
      ) {
        let txItem = (transaction.withdrawTransactions || []).find(
          (t: any) => t.transactionId === data.data
        );
        if (!txItem) {
          transaction.withdrawTransactions.push(useTransaction);
        }
      } else {
        transaction.withdrawTransactions.push(useTransaction);
      }

      transaction.destinationAmount = data.withdraw.destinationAmount
        ? data.withdraw.destinationAmount
        : null;

      transaction.status =
        utils.swapAndWithdrawTransactionStatuses.swapWithdrawCompleted;
    } else {
      transaction.status =
        utils.swapAndWithdrawTransactionStatuses.swapWithdrawFailed;
    }

    transaction.responseCode = data?.responseCode;
    transaction.responseMessage = data?.responseMessage;
    transaction.updatedAt = new Date();

    transaction = await db.SwapAndWithdrawTransactions.findOneAndUpdate(
      { _id: transaction._id },
      transaction,
      { new: true }
    );
  } catch (e) {
    console.log(e);
  }
};
