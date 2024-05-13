module.exports = function (router: any) {
  router.get("/fee-distribution", async (req: any, res: any) => {
    const referral = await db.Referrals.findOne({ code: req.query.code });
    if (!referral) {
      return res.http200({
        feeDistribution: undefined,
      });
    }
    const userAddress = await db.Addresses.findOne({ user: referral.user });
    let feeManagement;
    if (userAddress) {
      feeManagement = await db.ReferralFeeManagement.findOne({
        userAddresses: userAddress.address,
      });
    }
    if (!feeManagement) {
      feeManagement = await db.ReferralFeeManagement.findOne({
        tier: "General",
      });
    }
    return res.http200({
      feeDistribution: {
        recipient: userAddress.address,
        rateInBps: feeManagement?.fee,
      },
    });
  });
};
