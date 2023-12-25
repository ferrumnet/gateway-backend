export const handleGeneratorRequest = async (data: any, swapTxHash: string) => {
  try {
    let filter: any = {
      receiveTransactionId: swapTxHash,
      status: utils.swapAndWithdrawTransactionStatuses.swapPending,
    };

    let transaction = await db.SwapAndWithdrawTransactions.findOne(filter)
      .populate("sourceNetwork")
      .populate("sourceCabn");

    if (data && transaction) {
      let transactionReceipt = data?.transactionReceipt;

      transaction = getGeneratorSignedData(transaction, data?.signedData);

      transaction = await getTransactionDetail(transaction, data?.signedData);

      if (transactionReceipt?.status && transactionReceipt?.status == true) {
        transaction.status =
          utils.swapAndWithdrawTransactionStatuses.generatorSignatureCreated;
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

function getGeneratorSignedData(transaction: any, signedData: any) {
  try {
    transaction.generatorSig.salt = signedData?.salt;
    transaction.generatorSig.signatures = signedData?.signatures;
  } catch (e) {
    console.log(e);
  }
  return transaction;
}

async function getTransactionDetail(transaction: any, signedData: any) {
  try {
    transaction.sourceWalletAddress = signedData.from;
    transaction.destinationWalletAddress = signedData.targetAddress;
    if (transaction.sourceNetwork.isNonEVM == false) {
      transaction.sourceAmount = signedData.amount;
      if (transaction.sourceAmount) {
        transaction.sourceAmount = await swapUtilsHelper.amountToHuman_(
          transaction.sourceNetwork,
          transaction.sourceCabn,
          transaction.sourceAmount
        );
      }
    }
  } catch (e) {
    console.log(e);
  }
  return transaction;
}
