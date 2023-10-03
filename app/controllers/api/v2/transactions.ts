var mongoose = require("mongoose");
const TAG_FIBER = "fiber";
let TAG_GENERATOR = "";
let TAG_VALIDATOR = "";
let TAG_MASTER = "";
let TAG_MASTER_VALIDATION_ERROR = "masterValidatorError";

const NUMBER_OF_VALIDATORS_SHOULD_BE = 1;

module.exports = function (router: any) {
  router.put(
    "/update/swap/and/withdraw/job/:txHash",
    asyncMiddleware(async (req: any, res: any) => {
      TAG_GENERATOR = utils.nodeTypes.generator;
      TAG_VALIDATOR = utils.nodeTypes.validator;
      TAG_MASTER = utils.nodeTypes.master;
      commonFunctions.doAuthForNodeApis(req);

      if (req.query.isFrom == TAG_FIBER) {
        await handleFIBERRequest(req);
      } else {
        await handleNodesRequest(req, res);
      }
      return res.http200({
        message: stringHelper.strSuccess,
      });
    })
  );

  async function getTransactionDetail(
    swapAndWithdrawTransaction: any,
    signedData: any
  ) {
    try {
      swapAndWithdrawTransaction.sourceWalletAddress = signedData.from;
      swapAndWithdrawTransaction.destinationWalletAddress =
        signedData.targetAddress;
      if (swapAndWithdrawTransaction.sourceNetwork.isNonEVM == false) {
        swapAndWithdrawTransaction.sourceAmount = signedData.amount;
        if (swapAndWithdrawTransaction.sourceAmount) {
          swapAndWithdrawTransaction.sourceAmount =
            await swapUtilsHelper.amountToHuman_(
              swapAndWithdrawTransaction.sourceNetwork,
              swapAndWithdrawTransaction.sourceCabn,
              swapAndWithdrawTransaction.sourceAmount
            );
        }
      }
    } catch (e) {
      console.log(e);
    }
    return swapAndWithdrawTransaction;
  }

  function getGeneratorSignedData(
    swapAndWithdrawTransaction: any,
    signedData: any
  ) {
    try {
      console.log(signedData.signatures);
      swapAndWithdrawTransaction.generatorSig.salt = signedData?.salt;
      swapAndWithdrawTransaction.generatorSig.signatures =
        signedData?.signatures;
    } catch (e) {
      console.log(e);
    }
    return swapAndWithdrawTransaction;
  }

  function getValidatorSignedData(
    swapAndWithdrawTransaction: any,
    signedData: any
  ) {
    try {
      let validator: any = {};
      validator.salt = signedData.salt;
      validator.address = signedData.address.toLowerCase();
      validator.signatures = signedData.signatures;
      swapAndWithdrawTransaction.validatorSig.push(validator);
    } catch (e) {
      console.log(e);
    }
    return swapAndWithdrawTransaction;
  }

  function getMasterSignedData(
    swapAndWithdrawTransaction: any,
    signedData: any
  ) {
    try {
      swapAndWithdrawTransaction.payBySig.salt = signedData.salt;
      swapAndWithdrawTransaction.payBySig.hash = signedData.hash;
      swapAndWithdrawTransaction.payBySig.signatures = signedData.signatures;
    } catch (e) {
      console.log(e);
    }
    return swapAndWithdrawTransaction;
  }

  async function handleMasterValidationError(swapAndWithdrawTransaction: any) {
    swapAndWithdrawTransaction =
      await db.SwapAndWithdrawTransactions.findOneAndUpdate(
        { _id: swapAndWithdrawTransaction._id },
        {
          status:
            utils.swapAndWithdrawTransactionStatuses.masterValidationFailed,
        },
        { new: true }
      );
  }

  async function handleFIBERRequest(req: any) {
    try {
      if (req.body && req.params.txHash) {
        let withdrawData = req.body;
        if (withdrawData) {
          console.log("doSwapAndWithdraw withdrawHash", withdrawData);
          let swapAndWithdrawTransactionObject =
            await db.SwapAndWithdrawTransactions.findOne({
              receiveTransactionId: req.params.txHash,
            });

          let filter: any = {};
          filter._id = swapAndWithdrawTransactionObject._id;

          if (!swapAndWithdrawTransactionObject) {
            throw "Invalid operation";
          }

          let useTransaction = {
            transactionId: withdrawData.data,
            status:
              utils.swapAndWithdrawTransactionStatuses.swapWithdrawCompleted,
            timestamp: new Date(),
          };

          if (
            swapAndWithdrawTransactionObject.withdrawTransactions &&
            swapAndWithdrawTransactionObject.withdrawTransactions.length > 0
          ) {
            let txItem = (
              swapAndWithdrawTransactionObject.withdrawTransactions || []
            ).find((t: any) => t.transactionId === withdrawData.data);
            if (!txItem) {
              swapAndWithdrawTransactionObject.withdrawTransactions.push(
                useTransaction
              );
            }
          } else {
            swapAndWithdrawTransactionObject.withdrawTransactions.push(
              useTransaction
            );
          }

          if (withdrawData.withdraw.destinationAmount) {
            swapAndWithdrawTransactionObject.destinationAmount =
              withdrawData.withdraw.destinationAmount;
          }

          swapAndWithdrawTransactionObject.status =
            utils.swapAndWithdrawTransactionStatuses.swapWithdrawCompleted;
          swapAndWithdrawTransactionObject.updatedAt = new Date();
          swapAndWithdrawTransactionObject =
            await db.SwapAndWithdrawTransactions.findOneAndUpdate(
              filter,
              swapAndWithdrawTransactionObject
            );
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function handleNodesRequest(req: any, res: any) {
    try {
      let filter: any = {};

      if (!req.params.txHash) {
        return res.http400("txHash is required.");
      }

      filter.receiveTransactionId = req.params.txHash;

      if (req.query.isFrom == TAG_GENERATOR) {
        filter.status = utils.swapAndWithdrawTransactionStatuses.swapPending;
      } else if (req.query.isFrom == TAG_VALIDATOR) {
        filter.status =
          utils.swapAndWithdrawTransactionStatuses.generatorSignatureCreated;
        filter.validatorSig = {
          $not: { $elemMatch: { address: req.query.address } },
        };
      } else if (
        req.query.isFrom == TAG_MASTER_VALIDATION_ERROR ||
        req.query.isFrom == TAG_MASTER
      ) {
        filter.status =
          utils.swapAndWithdrawTransactionStatuses.validatorSignatureCreated;
      }

      let swapAndWithdrawTransaction =
        await db.SwapAndWithdrawTransactions.findOne(filter)
          .populate("sourceNetwork")
          .populate("destinationNetwork")
          .populate("sourceCabn")
          .populate("destinationCabn");

      if (
        swapAndWithdrawTransaction &&
        req.query.isFrom == TAG_MASTER_VALIDATION_ERROR
      ) {
        await handleMasterValidationError(swapAndWithdrawTransaction);
        return;
      }

      if (req.body && swapAndWithdrawTransaction) {
        let transactionReceipt = req?.body?.transactionReceipt;

        if (req.query.isFrom == TAG_GENERATOR) {
          swapAndWithdrawTransaction = getGeneratorSignedData(
            swapAndWithdrawTransaction,
            req.body.signedData
          );
          swapAndWithdrawTransaction = await getTransactionDetail(
            swapAndWithdrawTransaction,
            req.body.signedData
          );
        } else if (req.query.isFrom == TAG_VALIDATOR) {
          swapAndWithdrawTransaction = getValidatorSignedData(
            swapAndWithdrawTransaction,
            req.body.signedData
          );
        } else if (req.query.isFrom == TAG_MASTER) {
          swapAndWithdrawTransaction = getMasterSignedData(
            swapAndWithdrawTransaction,
            req.body.signedData
          );
        }

        if (transactionReceipt?.status && transactionReceipt?.status == true) {
          if (req.query.isFrom == TAG_GENERATOR) {
            swapAndWithdrawTransaction.status =
              utils.swapAndWithdrawTransactionStatuses.generatorSignatureCreated;
          } else if (req.query.isFrom == TAG_VALIDATOR) {
            if (
              swapAndWithdrawTransaction?.validatorSig?.length ==
              NUMBER_OF_VALIDATORS_SHOULD_BE
            ) {
              swapAndWithdrawTransaction.status =
                utils.swapAndWithdrawTransactionStatuses.validatorSignatureCreated;
            }
          } else {
            swapAndWithdrawTransaction.status =
              utils.swapAndWithdrawTransactionStatuses.swapCompleted;
          }
        } else {
          swapAndWithdrawTransaction.status =
            utils.swapAndWithdrawTransactionStatuses.swapFailed;
        }

        swapAndWithdrawTransaction.updatedAt = new Date();
        console.log(
          "swapAndWithdrawTransaction",
          swapAndWithdrawTransaction.status
        );
        swapAndWithdrawTransaction =
          await db.SwapAndWithdrawTransactions.findOneAndUpdate(
            { _id: swapAndWithdrawTransaction._id },
            swapAndWithdrawTransaction,
            { new: true }
          );
      }
    } catch (e) {
      console.log(e);
    }
  }
};
