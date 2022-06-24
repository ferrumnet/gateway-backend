const { db } = global;
const { isValidObjectId } = require("mongoose");

module.exports = function (router) {
  router.post("/create", async (req, res) => {
    if (
      (!req.body.stakingContractAddresses && !req.body.stakingContractAddresses.length) ||
      !req.body.currencyAddressByNetwork
    ) {
      return res.http400(
        "Staking Contract Addresses & currencyAddressByNetwork are required."
      );
    }
    const stakingsContractsAddress = await db.StakingsContractsAddresses.create(
      req.body
    );
    return res.http200({ stakingsContractsAddress });
  });

  // update status
  router.patch("/update/:id", async (req, res) => {
    const filter = { _id: req.params.id };
    const payload = { isActive: req.body.isActive };

    if (isValidObjectId(filter._id) && typeof payload.isActive == "boolean") {
      const stakingContractAddress =
        await db.StakingsContractsAddresses.findOneAndUpdate(filter, payload, {
          new: true,
        });
      return res.http200({ stakingContractAddress });
    }
    return res.http400("Valid id and isActive is required.");
  });

  // list
  router.get("/list", async (req, res) => {
    let stakingContractAddresses;
    if (req.query.isPagination != null && req.query.isPagination == "false") {
      stakingContractAddresses = await db.StakingsContractsAddresses.find();
    } else {
      stakingContractAddresses = await db.StakingsContractsAddresses.find()
        .skip(req.query.offset ? parseInt(req.query.offset) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit) : 10);
    }
    return res.http200({
      stakingContractAddresses,
    });
  });
};
