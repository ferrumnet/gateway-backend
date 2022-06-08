const { db, asyncMiddleware, stakingTrackerHelper } = global;

module.exports = function (router) {
  router.get(
    "/list/stakingContractAddress/:stakingContractAddress/currencyAddressesByNetwork/:currencyAddressesByNetwork",
    asyncMiddleware(async (req, res) => {
      const cabn = await db.CurrencyAddressesByNetwork.findOne({
        _id: req.params.currencyAddressesByNetwork,
      });
      if (cabn) {
        const participants = await stakingTrackerHelper.intiatParticipentsData(
          cabn._id,
          req.params.stakingContractAddress
        );
        return res.http200({ participants });
      }
      return res.http404("CABN not found");
    })
  );
};
