import {
  generateUniqueReferralCode,
  getUserReferral,
} from "../../../../../helpers/multiSwapHelpers//referralHelper";

module.exports = function (router: any) {
  router.post("/create/referral/code", async (req: any, res: any) => {
    const uniqueReferralCode = generateUniqueReferralCode();
    let referral = await getUserReferral(req.user._id);
    if (referral) {
      return res.http200({ referral });
    }
    referral = await db.Referrals.create({
      user: req.user._id,
      code: uniqueReferralCode,
    });

    return res.http200({ referral });
  });

  router.get("/referral/code", async (req: any, res: any) => {
    let referral = await getUserReferral(req.user._id);
    if (!referral) {
      return res.http400({
        message: "Referral code does not exists for this user",
      });
    }

    return res.http200({ referral });
  });
};
