export const handleGeneratorRequest = async (data: any, swapTxHash: string) => {
  try {
    let filter: any = {
      receiveTransactionId: swapTxHash,
      status: utils.swapAndWithdrawTransactionStatuses.swapPending,
      "generatorSig.salt": "",
    };
    let transaction = await db.SwapAndWithdrawTransactions.findOne(filter)
      .populate("sourceNetwork")
      .populate("sourceCabn")
      .populate("destinationNetwork")
      .populate("destinationCabn");

    if (data && transaction) {
      filter._id = transaction._id;
      let transactionReceipt = data?.transactionReceipt;
      if (
        transactionReceipt?.status &&
        transactionReceipt?.status == true &&
        data?.signedData
      ) {
        transaction = getGeneratorSignedData(transaction, data?.signedData);
        transaction = await getTransactionDetail(transaction, data?.signedData);
        transaction.status =
          utils.swapAndWithdrawTransactionStatuses.generatorSignatureCreated;
      } else {
        transaction.status =
          utils.swapAndWithdrawTransactionStatuses.swapFailed;
      }
      transaction.updatedAt = new Date();
      transaction = await db.SwapAndWithdrawTransactions.findOneAndUpdate(
        filter,
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
    transaction.generatorSig.address = signedData?.address;
    transaction.generatorSig.signatures = signedData?.signatures;
    transaction.generatorSig.updatedAt = new Date();
    transaction.sourceToken = signedData?.token;
    transaction.targetToken = signedData?.targetToken;
  } catch (e) {
    console.log(e);
  }
  return transaction;
}

async function getTransactionDetail(transaction: any, signedData: any) {
  try {
    transaction.sourceWalletAddress = signedData?.sourceAddress;
    transaction.destinationWalletAddress = signedData?.targetAddress;
    transaction.destinationAmountIn = signedData?.destinationAmountIn;
    transaction.destinationAmountOut = signedData?.destinationAmountOut;
    transaction.sourceOneInchData = signedData?.sourceOneInchData;
    transaction.destinationOneInchData = signedData?.destinationOneInchData;
    transaction.withdrawalData = signedData?.withdrawalData;
    transaction.signatureExpiry = signedData?.expiry;
    transaction.settledAmount = signedData?.settledAmount;
    if (transaction.sourceNetwork.isNonEVM == false) {
      transaction.sourceAmount = signedData.amount;
      transaction.sourceAmountInMachine = signedData.amount;
      transaction.destinationAmount = signedData.amontOut;
      if (transaction.sourceAmount) {
        transaction.sourceAmount = await getAmount(transaction);
      }
    }
  } catch (e) {
    console.log(e);
  }
  return transaction;
}

async function getAmount(transaction: any) {
  let amount;
  try {
    transaction.sourceAmount = await swapUtilsHelper.amountToHuman_(
      transaction.sourceNetwork,
      transaction.sourceCabn,
      transaction.sourceAmount
    );
  } catch (e) {
    console.log("for nativ tokens");
    transaction.sourceAmount = await swapUtilsHelper.amountToHuman(
      transaction.sourceAmount,
      transaction.sourceCabn.decimals
    );
  }

  return amount;
}
