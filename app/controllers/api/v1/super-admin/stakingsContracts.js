const { db } = global;

module.exports = function (router) {
  router.post("/create", async (req, res) => {
    if (
      !req.body.stakingContractAddress ||
      !req.body.currencyAddressesByNetwork
    ) {
      return res.http400(
        "Staking Contract Address & currencyAddressesByNetwork are required."
      );
    }
    const stakingsContractsAddress = await db.StakingsContractsAddresses.create(req.body);
    return res.http200({ stakingsContractsAddress,});
  });
};
