export const handleMasterSignatureCreationRequest = async (
  data: any,
  swapTxHash: string
) => {
  try {
    let filter: any = {
      receiveTransactionId: swapTxHash,
      status:
        utils.swapAndWithdrawTransactionStatuses.validatorSignatureCreated,
    };

    let transaction = await db.SwapAndWithdrawTransactions.findOne(filter);

    if (data && transaction) {
      let transactionReceipt = data?.transactionReceipt;

      transaction = getMasterSignedData(transaction, data?.signedData);

      if (transactionReceipt?.status && transactionReceipt?.status == true) {
        transaction.status =
          utils.swapAndWithdrawTransactionStatuses.swapCompleted;
      } else {
        transaction.status =
          utils.swapAndWithdrawTransactionStatuses.swapFailed;
      }

      transaction.updatedAt = new Date();

      transaction = await db.SwapAndWithdrawTransactions.findOneAndUpdate(
        { _id: transaction._id },
        transaction,
        { new: true }
      );
    }
  } catch (e) {
    console.log(e);
  }
};

export const handleMasterValidationFailureRequest = async (
  swapTxHash: string
) => {
  try {
    let filter: any = {
      receiveTransactionId: swapTxHash,
      status:
        utils.swapAndWithdrawTransactionStatuses.validatorSignatureCreated,
    };
    let transaction = await db.SwapAndWithdrawTransactions.findOne(filter);
    transaction = await db.SwapAndWithdrawTransactions.findOneAndUpdate(
      { _id: transaction?._id },
      {
        status: utils.swapAndWithdrawTransactionStatuses.masterValidationFailed,
        updatedAt: new Date(),
      },
      { new: true }
    );
  } catch (e) {
    console.log(e);
  }
};

function getMasterSignedData(transaction: any, signedData: any) {
  try {
    transaction.payBySig.salt = signedData.salt;
    transaction.payBySig.hash = signedData.hash;
    transaction.payBySig.signatures = signedData.signatures;
    transaction.payBySig.updatedAt = new Date();
  } catch (e) {
    console.log(e);
  }
  return transaction;
}
