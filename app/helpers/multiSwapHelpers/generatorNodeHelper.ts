export const handleGeneratorRequest = async (data: any, swapTxHash: string) => {
  try {
    let filter: any = {
      receiveTransactionId: swapTxHash,
      status: utils.swapAndWithdrawTransactionStatuses.swapPending,
    };

    let transaction = await db.SwapAndWithdrawTransactions.findOne(filter)
      .populate("sourceNetwork")
      .populate("sourceCabn")
      .populate("destinationNetwork")
      .populate("destinationCabn");

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
    transaction.generatorSig.updatedAt = new Date();
  } catch (e) {
    console.log(e);
  }
  return transaction;
}

async function getTransactionDetail(transaction: any, signedData: any) {
  try {
    transaction.sourceWalletAddress = signedData?.from;
    transaction.destinationWalletAddress = signedData?.targetAddress;
    transaction.destinationAmountIn = signedData?.destinationAmountIn;
    transaction.destinationAmountOut = signedData?.destinationAmountOut;
    transaction.sourceOneInchData = signedData?.sourceOneInchData;
    transaction.destinationOneInchData = signedData?.destinationOneInchData;
    transaction.withdrawalData = signedData?.withdrawalData;
    transaction.signatureExpiry = signedData?.expiry;
    if (transaction.sourceNetwork.isNonEVM == false) {
      transaction.sourceAmount = signedData.amount;
      transaction.sourceAmountInMachine = signedData.amount;
      transaction.destinationAmount = signedData.amontOut;
      if (transaction.sourceAmount) {
        transaction.sourceAmount = await swapUtilsHelper.amountToHuman_(
          transaction.sourceNetwork,
          transaction.sourceCabn,
          transaction.sourceAmount
        );
      }
      if (transaction.destinationAmount) {
        transaction.destinationAmount = await swapUtilsHelper.amountToHuman_(
          transaction.destinationNetwork,
          transaction.destinationCabn,
          transaction.destinationAmount
        );
      }
    }
  } catch (e) {
    console.log(e);
  }
  return transaction;
}
