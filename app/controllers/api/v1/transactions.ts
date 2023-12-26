import { handleGeneratorRequest } from "../../../helpers/multiSwapHelpers/generatorNodeHelper";
import { handleValidatorRequest } from "../../../helpers/multiSwapHelpers/validatorNodeHelper";
import {
  handleMasterSignatureCreationRequest,
  handleMasterValidationFailureRequest,
} from "../../../helpers/multiSwapHelpers/masterNodeHelper";
import { handleFiberRequest } from "../../../helpers/multiSwapHelpers/fiberHelper";

module.exports = function (router: any) {
  router.get(
    "/list",
    asyncMiddleware(async (req: any, res: any) => {
      var filter: any = {};
      let sort = { createdAt: -1 };
      let transactions = null;

      if (req.query.status) {
        filter.status = req.query.status;
      }

      if (req.query.address) {
        filter.validatorSig = {
          $not: { $elemMatch: { address: req.query.address } },
        };
      }

      filter.version = "v3";

      console.log(filter);

      if (req.query.isPagination != null && req.query.isPagination == "false") {
        transactions = await db.SwapAndWithdrawTransactions.find(filter)
          .populate({
            path: "destinationNetwork",
            populate: {
              path: "multiswapNetworkFIBERInformation",
              model: "multiswapNetworkFIBERInformations",
            },
          })
          .populate({
            path: "sourceNetwork",
            populate: {
              path: "multiswapNetworkFIBERInformation",
              model: "multiswapNetworkFIBERInformations",
            },
          })
          .sort(sort);
      } else {
        transactions = await db.SwapAndWithdrawTransactions.find(filter)
          .populate({
            path: "destinationNetwork",
            populate: {
              path: "multiswapNetworkFIBERInformation",
              model: "multiswapNetworkFIBERInformations",
            },
          })
          .populate({
            path: "sourceNetwork",
            populate: {
              path: "multiswapNetworkFIBERInformation",
              model: "multiswapNetworkFIBERInformations",
            },
          })
          .sort(sort)
          .skip(req.query.offset ? parseInt(req.query.offset) : 0)
          .limit(req.query.limit ? parseInt(req.query.limit) : 10);
      }

      return res.http200({
        transactions: transactions,
      });
    })
  );

  router.put(
    "/update/from/fiber/:swapTxHash",
    asyncMiddleware(async (req: any, res: any) => {
      await handleFiberRequest(req?.body, req?.params?.swapTxHash);
      return res.http200({
        message: stringHelper.strSuccess,
      });
    })
  );

  router.put(
    "/update/from/generator/:swapTxHash",
    asyncMiddleware(async (req: any, res: any) => {
      await handleGeneratorRequest(req?.body, req?.params?.swapTxHash);
      return res.http200({
        message: stringHelper.strSuccess,
      });
    })
  );

  router.put(
    "/update/from/validator/:swapTxHash",
    asyncMiddleware(async (req: any, res: any) => {
      await handleValidatorRequest(
        req?.body,
        req?.params?.swapTxHash,
        req?.query
      );
      return res.http200({
        message: stringHelper.strSuccess,
      });
    })
  );

  router.put(
    "/update/from/master/:swapTxHash",
    asyncMiddleware(async (req: any, res: any) => {
      if (req.query.isValidationFailed) {
        await handleMasterValidationFailureRequest(req?.params?.swapTxHash);
      } else {
        await handleMasterSignatureCreationRequest(
          req?.body,
          req?.params?.swapTxHash
        );
      }
      return res.http200({
        message: stringHelper.strSuccess,
      });
    })
  );
};
