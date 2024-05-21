import { isValidObjectId } from "mongoose";
import { saveRandomKeys } from "../../../../helpers/multiSwapHelpers/randomOrdinalsPassportKeyHelper";
let stringHelper = (global as any).stringHelper;

module.exports = function (router: any) {
  router.post("/import", async (req: any, res: any) => {
    if (!req.body.data || req.body.data.length == 0) {
      return res.http400("data is required.");
    }
    await saveRandomKeys(req.body.data);
    return res.http200({
      message: stringHelper.strSuccess,
    });
  });

  router.delete("/:id", async (req: any, res: any) => {
    await db.RandomOrdinalsPassportKeys.remove({ _id: req.params.id });
    return res.http200({
      message: stringHelper.strSuccess,
    });
  });
};
