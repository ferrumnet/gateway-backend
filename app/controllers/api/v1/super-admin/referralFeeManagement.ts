import mongoose from "mongoose";

module.exports = function (router: any) {
  router.post("/referral/fee/management", async (req: any, res: any) => {
    if (!req.body.tier && !req.body.fee && !req.body.feeType) {
      return res.http400("tier, fee, feeType are required.");
    }
    const referralFeeManagement = await db.ReferralFeeManagement.create(
      req.body
    );

    return res.http200({ referralFeeManagement });
  });

  router.put("/referral/fee/management/:id", async (req: any, res: any) => {
    if (!req.params.id) {
      return res.http400("id is required.");
    }
    if (!req.body.tier && !req.body.fee && !req.body.feeType) {
      return res.http400("tier, fee, feeType are required.");
    }
    const referralFeeManagement =
      await db.ReferralFeeManagement.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(req.params.id) },
        { ...req.body },
        { new: true }
      );

    return res.http200({ referralFeeManagement });
  });
};
