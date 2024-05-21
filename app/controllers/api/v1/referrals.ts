module.exports = function (router: any) {
  router.get("/fee-distribution", async (req: any, res: any) => {
    let referral;
    const address = await db.Addresses.findOne({
      address: req.query.walletAddress.toLowerCase(),
    }).populate("user");
    if (address?.user && address?.user?.referral) {
      referral = await db.Referrals.findOne({ _id: address.user.referral });
    } else if (address.user && req.query.code) {
      referral = await db.Referrals.findOne({ code: req.query.code });
      if (referral) {
        await db.Users.updateOne(
          { _id: address.user._id },
          { $set: { referral: referral._id } }
        );
      }
    }
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
        fee: feeManagement?.fee,
        discount: feeManagement?.discount,
      },
    });
  });
};
