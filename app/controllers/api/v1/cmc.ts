import { getOneInchExcludedProtocols } from "../../../helpers/multiSwapHelpers/configurationHelper";
import { getCMCQuote } from "../../../lib/httpCalls/coinMarketCapAxiosHelper";
import { oneInchSwap } from "../../../lib/httpCalls/quoteProvideAxiosHelper";
let asyncMiddleware = require("../../../lib/response/asyncMiddleware");

module.exports = function (router: any) {
  router.get(
    "/quotes",
    asyncMiddleware(async (req: any, res: any) => {
      if (!req.query.symbol) {
        throw "symbol";
      }
      return res.http200({
        data: await getCMCQuote(req.query.symbol),
      });
    })
  );
};
