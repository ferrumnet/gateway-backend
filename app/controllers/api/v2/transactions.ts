import { handleGeneratorRequest } from "../../../lib/middlewares/helpers/multiSwapHelpers/generatorNodeHelper";
import { handleValidatorRequest } from "../../../lib/middlewares/helpers/multiSwapHelpers/validatorNodeHelper";
import {
  handleMasterSignatureCreationRequest,
  handleMasterValidationFailureRequest,
} from "../../../lib/middlewares/helpers/multiSwapHelpers/masterNodeHelper";
import { handleFiberRequest } from "../../../lib/middlewares/helpers/multiSwapHelpers/fiberHelper";

module.exports = function (router: any) {
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
    "/update/from/generator/:txHash",
    asyncMiddleware(async (req: any, res: any) => {
      await handleGeneratorRequest(req?.body, req?.params?.txHash);
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
