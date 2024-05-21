import {
  attachAddressWithRandomKey,
  findRandomKeyByTag,
} from "../../../helpers/multiSwapHelpers/randomOrdinalsPassportKeyHelper";
let asyncMiddleware = require("../../../lib/response/asyncMiddleware");

module.exports = function (router: any) {
  router.post(
    "/attach/address",
    asyncMiddleware(async (req: any, res: any) => {
      const { address } = req.body;
      if (!address) {
        return res.http400("address is required.");
      }
      return res.http200({
        data: await attachAddressWithRandomKey(address),
      });
    })
  );

  router.get(
    "/:tag",
    asyncMiddleware(async (req: any, res: any) => {
      const { tag } = req.params;
      if (!tag) {
        return res.http400("tag is required.");
      }
      return res.http200({
        data: await findRandomKeyByTag(tag),
      });
    })
  );
};
