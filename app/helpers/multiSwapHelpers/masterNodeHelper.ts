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
      transaction = getMasterSignedData(transaction, data?.signedData);
      transaction.status =
        utils.swapAndWithdrawTransactionStatuses.swapCompleted;
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
    transaction.withdrawalSig.salt = signedData.salt;
    transaction.withdrawalSig.hash = signedData.hash;
    transaction.withdrawalSig.signatures = signedData.signatures;
    transaction.withdrawalSig.updatedAt = new Date();
  } catch (e) {
    console.log(e);
  }
  return transaction;
}
