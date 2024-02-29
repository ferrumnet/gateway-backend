import { isValidObjectId } from "mongoose";
import { makeCabnDefault } from "../../../../helpers/multiSwapHelpers/cabnsHelper";

module.exports = function (router: any) {
  router.post("/create", async (req: any, res: any) => {
    if (
      !req.body.name ||
      !req.body.symbol ||
      !req.body.networks ||
      !req.body.organization
    ) {
      return res.http400(
        "name & symbol & networks & organization are required."
      );
    }

    if (req.body.networks && req.body.networks.length == 0) {
      return res.http400(
        await commonFunctions.getValueFromStringsPhrase(
          stringHelper.strErrorCurrencyShouldAssociateWithAtleastOneNetwork
        ),
        stringHelper.strErrorCurrencyShouldAssociateWithAtleastOneNetwork
      );
    }

    let error = await commonFunctions.validationForUniqueCBN(req, res);
    if (error) {
      return res.http400(error);
    }

    req.body.createdByUser = req.user._id;
    req.body.updatedByUser = req.user._id;
    req.body.createdByOrganization = req.body.organization;

    req.body.nameInLower = req.body.name.toLowerCase();
    req.body.createdAt = new Date();
    req.body.updatedAt = new Date();

    let currency = await db.Currencies.create(req.body);
    currency.currencyAddressesByNetwork =
      await currencyHelper.createCurrencyAddresses(req, currency, req.body);
    currency = await db.Currencies.findOneAndUpdate(
      { _id: currency },
      currency,
      { new: true }
    );

    return res.http200({
      currency: currency,
    });
  });

  router.post("/update/:id", async (req: any, res: any) => {
    if (!req.body.name || !req.body.symbol || !req.body.organization) {
      return res.http400("name & symbol & organization are required.");
    }

    if (req.body.networks) {
      delete req.body.networks;
    }

    req.body.updatedByUser = req.user._id;
    req.body.createdByOrganization = req.body.organization;

    req.body.nameInLower = req.body.name.toLowerCase();
    req.body.updatedAt = new Date();
    console.log(req.body);

    let currency = await db.Currencies.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );

    return res.http200({
      currency: currency,
    });
  });

  router.get("/list", async (req: any, res: any) => {
    var matchFilter: any = {};
    var filterOrList = [];
    var filterAndList: any = [];
    var filter = [];
    let currencies = [];
    var sort = { createdAt: -1 };

    if (req.query.search) {
      let reg = new RegExp(unescape(req.query.search), "i");
      filterOrList.push({ nameInLower: reg });
      filterOrList.push({ symbol: reg });
      filterOrList.push({
        currencyAddressesByNetwork: {
          $elemMatch: { tokenContractAddress: reg },
        },
      });
    }

    if (filterOrList && filterOrList.length > 0) {
      matchFilter.$or = [];
      matchFilter.$or.push({ $or: filterOrList });
    }

    if (filterAndList && filterAndList.length > 0) {
      matchFilter.$and = [];
      matchFilter.$and.push({ $and: filterAndList });
    }

    if (req.query.isPagination != null && req.query.isPagination == "false") {
      filter = [
        {
          $lookup: {
            from: "currencyAddressesByNetwork",
            localField: "currencyAddressesByNetwork",
            foreignField: "_id",
            as: "currencyAddressesByNetwork",
          },
        },
        { $match: matchFilter },
        { $sort: sort },
      ];
    } else {
      filter = [
        {
          $lookup: {
            from: "currencyAddressesByNetwork",
            localField: "currencyAddressesByNetwork",
            foreignField: "_id",
            as: "currencyAddressesByNetwork",
          },
        },
        { $match: matchFilter },
        { $sort: sort },
        { $skip: req.query.offset ? parseInt(req.query.offset) : 0 },
        { $limit: req.query.limit ? parseInt(req.query.limit) : 10 },
      ];
    }

    currencies = await db.Currencies.aggregate(filter);

    return res.http200({
      currencies: currencies,
    });
  });

  router.get("/:id", async (req: any, res: any) => {
    let filter = {};
    filter = { _id: req.params.id };

    let currencyAddressesByNetwork = [];
    let currency = await db.Currencies.findOne(filter)
      .populate({
        path: "currencyAddressesByNetwork",
        populate: {
          path: "network",
          model: "networks",
        },
      })
      .populate({
        path: "currencyAddressesByNetwork",
        populate: {
          path: "networkDex",
          populate: {
            path: "dex",
            model: "decentralizedExchanges",
          },
        },
      });

    return res.http200({
      currency: currency,
    });
  });

  router.delete("/:id", async (req: any, res: any) => {
    let filter = {};
    filter = { _id: req.params.id };

    if (
      (await currencyHelper.currencyAssociationWithNetwork(req, res)) > 0 &&
      (await currencyHelper.currencyAssociationWithLeaderboard(req, res)) > 0 &&
      (await currencyHelper.currencyAssociationWithTokenHoldersBalanceSnapshots(
        req,
        res
      )) > 0
    ) {
      return res.http400(
        await commonFunctions.getValueFromStringsPhrase(
          stringHelper.strErrorDelete
        ),
        stringHelper.strErrorDelete
      );
    }

    let response = await db.Currencies.remove(filter);

    return res.http200({
      currency: response,
    });
  });

  router.post("/create/cabn", async (req: any, res: any) => {
    if (!req.body.network || !req.body.currency) {
      return res.http400("network & currency are required.");
    }

    req.body.networks = [];
    req.body.networks.push(req.body.network);

    if (req.body.networks && req.body.networks.length == 0) {
      return res.http400(
        await commonFunctions.getValueFromStringsPhrase(
          stringHelper.strErrorCurrencyShouldAssociateWithAtleastOneNetwork
        ),
        stringHelper.strErrorCurrencyShouldAssociateWithAtleastOneNetwork
      );
    }

    let error = await commonFunctions.validationForUniqueCBN(req, res);
    if (error) {
      return res.http400(error);
    }

    req.body.createdByUser = req.user._id;
    req.body.createdByOrganization = req.user.organization;

    req.body.createdAt = new Date();

    let currency = await db.Currencies.findOne({ _id: req.body.currency });
    if (currency) {
      currency.currencyAddressesByNetwork.push(
        await currencyHelper.createCurrencyAddresses(req, currency, req.body)
      );
      console.log(currency);
      currency = await db.Currencies.findOneAndUpdate(
        { _id: currency },
        { currencyAddressesByNetwork: currency.currencyAddressesByNetwork },
        { new: true }
      );
    }

    return res.http200({
      currency: currency,
    });
  });

  router.get("/cabn/list", async (req: any, res: any) => {
    let filter: any = {};

    if (req.query.networkId) {
      filter.network = req.query.networkId;
    }

    let cabns = await db.CurrencyAddressesByNetwork.find(filter)
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10);

    return res.http200({
      cabns: cabns,
    });
  });

  router.get("/cabn/:id", async (req: any, res: any) => {
    let filter = {};
    filter = { _id: req.params.id };

    let cabn = await db.CurrencyAddressesByNetwork.findOne(filter)
      .populate("network")
      .populate("currency")
      .populate({
        path: "networkDex",
        populate: {
          path: "dex",
          model: "decentralizedExchanges",
        },
      });

    return res.http200({
      cabn: cabn,
    });
  });

  router.put("/cabn/base/fee/values/:id", async (req: any, res: any) => {
    let filter = { _id: req.params.id };

    if (req.body.baseFeeAmount == null || req.body.baseFeePercentage == null) {
      return res.http400("baseFeeAmount & baseFeePercentage are required.");
    }

    let oldCabnCount = await db.CurrencyAddressesByNetwork.countDocuments({
      _id: req.params.id,
      isBaseFeeToken: true,
    });

    if (oldCabnCount == 0) {
      return res.http400(
        await commonFunctions.getValueFromStringsPhrase(
          stringHelper.strErrorBaseFeeTokenIsNotSetupForUpdateCabn
        ),
        stringHelper.strErrorBaseFeeTokenIsNotSetupForUpdateCabn
      );
    }

    let cabn = await db.CurrencyAddressesByNetwork.findOneAndUpdate(
      filter,
      {
        baseFeeAmount: req.body.baseFeeAmount,
        baseFeePercentage: req.body.baseFeePercentage,
      },
      { new: true }
    );

    return res.http200({
      cabn: cabn,
    });
  });

  router.put("/cabn/allow/on/multi/swap/:id", async (req: any, res: any) => {
    let filter = { _id: req.params.id };
    let isAllowedOnMultiSwap = req.body.isAllowedOnMultiSwap;

    if (
      !isValidObjectId(filter._id) ||
      typeof isAllowedOnMultiSwap != "boolean"
    ) {
      return res.http400("Valid cabnId & isAllowedOnMultiSwap are required.");
    }
    let cabn = await db.CurrencyAddressesByNetwork.findOneAndUpdate(
      filter,
      { isAllowedOnMultiSwap },
      { new: true }
    );

    return res.http200({
      cabn: cabn,
    });
  });

  router.put("/cabn/allow/as/fee/token/:id", async (req: any, res: any) => {
    let filter = { _id: req.params.id };
    let isFeeToken = req.body.isFeeToken;

    if (!isValidObjectId(filter._id) || typeof isFeeToken != "boolean") {
      return res.http400("Valid cabnId & isFeeToken are required.");
    }
    let cabn = await db.CurrencyAddressesByNetwork.findOneAndUpdate(
      filter,
      { isFeeToken },
      { new: true }
    );

    return res.http200({
      cabn: cabn,
    });
  });

  router.put("/cabn/add/base/fee/token/:id", async (req: any, res: any) => {
    let filter: any = { _id: req.params.id };

    if (!req.body.networkId || !req.body.baseFeeAmount) {
      return res.http400("networkId & baseFeeAmount are required.");
    }

    let cabnCount = await currencyHelper.validateCabnToAddBaseFeeToken(
      req,
      res,
      false
    );

    if (cabnCount > 0) {
      return res.http400(
        await commonFunctions.getValueFromStringsPhrase(
          stringHelper.strErrorAddBaseFeeToken
        ),
        stringHelper.strErrorAddBaseFeeToken
      );
    }

    let body: any = {};
    body.isBaseFeeToken = true;
    body.baseFeeAmount = req.body.baseFeeAmount;
    body.baseFeePercentage = req.body.baseFeePercentage;
    console.log(filter);
    console.log(body);
    let cabn = await db.CurrencyAddressesByNetwork.findOneAndUpdate(
      filter,
      body,
      { new: true }
    );

    return res.http200({
      cabn: cabn,
    });
  });

  router.put("/cabn/update/base/fee/token/:id", async (req: any, res: any) => {
    let filter: any = { _id: req.params.id };

    if (!req.body.oldCabnId || !req.body.networkId || !req.body.baseFeeAmount) {
      return res.http400("oldCabnId & networkId & baseFeeAmount are required.");
    }

    if (req.body.oldCabnId == req.params.id) {
      return res.http400("old and new cabn id should not be same.");
    }

    let oldCabnCount = await db.CurrencyAddressesByNetwork.countDocuments({
      _id: req.body.oldCabnId,
      isBaseFeeToken: true,
      network: req.body.networkId,
    });

    if (oldCabnCount == 0) {
      return res.http400(
        await commonFunctions.getValueFromStringsPhrase(
          stringHelper.strErrorUpdateBaseFeeToken
        ),
        stringHelper.strErrorUpdateBaseFeeToken
      );
    }

    let cabnCount = await currencyHelper.validateCabnToAddBaseFeeToken(
      req,
      res,
      true
    );

    if (cabnCount > 0) {
      return res.http400(
        await commonFunctions.getValueFromStringsPhrase(
          stringHelper.strErrorAddBaseFeeToken
        ),
        stringHelper.strErrorAddBaseFeeToken
      );
    }

    let body: any = {};
    body.isBaseFeeToken = true;
    body.baseFeeAmount = req.body.baseFeeAmount;
    body.baseFeePercentage = req.body.baseFeePercentage;
    console.log(filter);
    console.log(body);
    await db.CurrencyAddressesByNetwork.findOneAndUpdate(
      { _id: req.body.oldCabnId },
      { isBaseFeeToken: false, baseFeeAmount: null },
      { new: true }
    );
    let cabn = await db.CurrencyAddressesByNetwork.findOneAndUpdate(
      filter,
      body,
      { new: true }
    );

    return res.http200({
      cabn: cabn,
    });
  });

  router.put("/cabn/update/decimals/:id", async (req: any, res: any) => {
    let filter: any = { _id: req.params.id };
    console.log("decimals", req.body.decimals);
    if (req.body.decimals == null) {
      return res.http400("decimals is required.");
    }

    let body: any = {};
    body.decimals = req.body.decimals;
    body.updatedAt = new Date();

    let cabn = await db.CurrencyAddressesByNetwork.findOneAndUpdate(
      filter,
      body,
      { new: true }
    );

    return res.http200({
      cabn: cabn,
    });
  });

  router.put(
    "/cabn/position/for/free/token/:id",
    async (req: any, res: any) => {
      let filter = { _id: req.params.id };
      let positionForFeeToken = req.body.positionForFeeToken;

      if (!isValidObjectId(filter._id) || !positionForFeeToken) {
        return res.http400("Valid cabnId & positionForFeeToken are required.");
      }
      let cabn = await db.CurrencyAddressesByNetwork.findOneAndUpdate(
        filter,
        { positionForFeeToken },
        { new: true }
      );

      return res.http200({
        cabn: cabn,
      });
    }
  );

  router.put("/cabn/set/non/evm/:id", async (req: any, res: any) => {
    let filter = { _id: req.params.id };
    let isNonEVM = req.body.isNonEVM;

    if (!isValidObjectId(filter._id) || typeof isNonEVM != "boolean") {
      return res.http400("Valid cabnId & isNonEVM are required.");
    }
    let cabn = await db.CurrencyAddressesByNetwork.findOneAndUpdate(
      filter,
      { isNonEVM },
      { new: true }
    );

    return res.http200({
      cabn: cabn,
    });
  });

  router.patch("/cabn/priority/:cabnId", async (req: any, res: any) => {
    if (!req.params.cabnId) {
      return res.http400("cabnId is required");
    }

    const cabn = await db.CurrencyAddressesByNetwork.findOneAndUpdate(
      { _id: req.params.cabnId },
      { $set: { priority: req.body.priority } },
      { new: true }
    );

    return res.http200({
      cabn,
    });
  });

  router.patch("/cabn/priority", async (req: any, res: any) => {
    if (!req.body.priorities || !req.body.priorities.length) {
      return res.http400(
        "Priorities array is required and should not be empty array."
      );
    }

    const cabns = await Promise.all(
      req.body.priorities.map((item: any) => {
        return db.CurrencyAddressesByNetwork.updateOne(
          { _id: item.cabnId },
          { $set: { priority: item.priority } },
          { new: true }
        );
      })
    );

    return res.http200({
      cabns,
    });
  });

  router.put("/cabn/update/make/default/:id", async (req: any, res: any) => {
    await makeCabnDefault(req.params.id);
    return res.http200({
      message: stringHelper.success,
    });
  });
};
