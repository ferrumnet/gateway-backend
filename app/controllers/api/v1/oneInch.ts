import { getOneInchExcludedProtocols } from "../../../helpers/multiSwapHelpers/configurationHelper";
import { oneInchSwap } from "../../../lib/httpCalls/quoteProvideAxiosHelper";
let asyncMiddleware = require("../../../lib/response/asyncMiddleware");

module.exports = function (router: any) {
  router.get(
    "/swap",
    asyncMiddleware(async (req: any, res: any) => {
      if (
        !req.query.walletAddress ||
        !req.query.chainId ||
        !req.query.src ||
        !req.query.dst ||
        !req.query.amount ||
        !req.query.from ||
        !req.query.receiver ||
        !req.query.slippage
      ) {
        throw "walletAddress & chainId & src & dst & amount & from & receiver and slippage are required ";
      }
      return res.http200({
        data: await oneInchSwap(
          req.query.walletAddress,
          req.query.chainId,
          req.query.src,
          req.query.dst,
          req.query.amount,
          req.query.from,
          req.query.receiver,
          req.query.slippage,
          await getOneInchExcludedProtocols()
        ),
      });
    })
  );
};
