var mongoose = require("mongoose");

module.exports = function (router: any) {
  router.get("/:name", async (req: any, res: any) => {
    let filter = {};
    filter = { name: req.params.name.toUpperCase() };

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

  router.get("/cabn/list", async (req: any, res: any) => {
    var matchFilter: any = {};
    var filterOrList = [];
    var filterAndList: any = [];
    var filter = [];
    let cabns = [];
    var sort = { createdAt: -1 };

    if (req.query.search) {
      let reg = new RegExp(unescape(req.query.search), "i");
      filterOrList.push({ "currency.nameInLower": reg });
      filterOrList.push({ "currency.symbol": reg });
      filterOrList.push({ tokenContractAddress: reg });
    }

    if (req.query.tokenContractAddress) {
      filterAndList.push({
        tokenContractAddress: req.query.tokenContractAddress.toLowerCase(),
      });
    }

    if (req.query.isAllowedOnMultiSwap) {
      if (req.query.isAllowedOnMultiSwap == "true") {
        filterAndList.push({ isAllowedOnMultiSwap: true });
      } else {
        filterAndList.push({ isAllowedOnMultiSwap: false });
      }
    }

    if (req.query.network) {
      filterAndList.push({
        "network._id": new mongoose.Types.ObjectId(req.query.network),
      });
    }

    if (req.query.chainId) {
      filterAndList.push({ "network.chainId": req.query.chainId });
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
            from: "networks",
            localField: "network",
            foreignField: "_id",
            as: "network",
          },
        },
        { $unwind: { path: "$network", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "networkDexes",
            localField: "networkDex",
            foreignField: "_id",
            as: "networkDex",
          },
        },
        { $unwind: { path: "$networkDex", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "currencies",
            localField: "currency",
            foreignField: "_id",
            as: "currency",
          },
        },
        { $unwind: { path: "$currency", preserveNullAndEmptyArrays: true } },
        { $match: matchFilter },
        { $sort: sort },
      ];
    } else {
      filter = [
        {
          $lookup: {
            from: "networks",
            localField: "network",
            foreignField: "_id",
            as: "network",
          },
        },
        { $unwind: { path: "$network", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "networkDexes",
            localField: "networkDex",
            foreignField: "_id",
            as: "networkDex",
          },
        },
        { $unwind: { path: "$networkDex", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "currencies",
            localField: "currency",
            foreignField: "_id",
            as: "currency",
          },
        },
        { $unwind: { path: "$currency", preserveNullAndEmptyArrays: true } },
        { $match: matchFilter },
        { $sort: sort },
        { $skip: req.query.offset ? parseInt(req.query.offset) : 0 },
        { $limit: req.query.limit ? parseInt(req.query.limit) : 10 },
      ];
    }

    cabns = await db.CurrencyAddressesByNetwork.aggregate(filter);

    return res.http200({
      currencyAddressesByNetworks: cabns,
    });
  });

  router.get("/cabn/for/fee/token/list", async (req: any, res: any) => {
    var matchFilter: any = {};
    var filterOrList: any = [];
    var filterAndList: any = [];
    var filter = [];
    let cabns = [];
    var sort: any = { createdAt: -1 };

    if (req.query.sortKey) {
      Object.keys(sort).forEach((key) => {
        delete sort[key];
      });
      sort = { [req.query.sortKey]: parseInt(req.query.sortOrder) };
    }

    if (req.query.isFeeToken) {
      if (req.query.isFeeToken == "true") {
        filterAndList.push({ isFeeToken: true });
      } else {
        filterAndList.push({ isFeeToken: false });
      }
    }

    if (req.query.isBaseFeeToken) {
      if (req.query.isBaseFeeToken == "true") {
        filterAndList.push({ isBaseFeeToken: true });
      } else {
        filterAndList.push({ isBaseFeeToken: false });
      }
    }

    if (req.query.networkId) {
      filterAndList.push({
        "network._id": new mongoose.Types.ObjectId(req.query.networkId),
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
            from: "networks",
            localField: "network",
            foreignField: "_id",
            as: "network",
          },
        },
        { $unwind: { path: "$network", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "networkDexes",
            localField: "networkDex",
            foreignField: "_id",
            as: "networkDex",
          },
        },
        { $unwind: { path: "$networkDex", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "currencies",
            localField: "currency",
            foreignField: "_id",
            as: "currency",
          },
        },
        { $unwind: { path: "$currency", preserveNullAndEmptyArrays: true } },
        { $match: matchFilter },
        { $sort: sort },
      ];
    } else {
      filter = [
        {
          $lookup: {
            from: "networks",
            localField: "network",
            foreignField: "_id",
            as: "network",
          },
        },
        { $unwind: { path: "$network", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "networkDexes",
            localField: "networkDex",
            foreignField: "_id",
            as: "networkDex",
          },
        },
        { $unwind: { path: "$networkDex", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "currencies",
            localField: "currency",
            foreignField: "_id",
            as: "currency",
          },
        },
        { $unwind: { path: "$currency", preserveNullAndEmptyArrays: true } },
        { $match: matchFilter },
        { $sort: sort },
        { $skip: req.query.offset ? parseInt(req.query.offset) : 0 },
        { $limit: req.query.limit ? parseInt(req.query.limit) : 10 },
      ];
    }

    cabns = await db.CurrencyAddressesByNetwork.aggregate(filter);

    return res.http200({
      currencyAddressesByNetworks: cabns,
    });
  });

  router.get("/token/data", async (req: any, res: any) => {
    var matchFilter: any = {};
    var filterOrList: any = [];
    var filterAndList: any = [];
    var filter = [];
    let cabns = [];
    var sort = { createdAt: -1 };
    var finalMatchFilter: any = {};

    if (!req.query.tokenContractAddress || !req.query.chainId) {
      return res.http400("tokenContractAddress & chainId are required.");
    }

    filterAndList.push({
      tokenContractAddress: req.query.tokenContractAddress.toLowerCase(),
    });
    filterAndList.push({ "network.chainId": req.query.chainId });

    if (filterOrList && filterOrList.length > 0) {
      matchFilter.$or = [];
      matchFilter.$or.push({ $or: filterOrList });
    }

    if (filterAndList && filterAndList.length > 0) {
      matchFilter.$and = [];
      matchFilter.$and.push({ $and: filterAndList });
    }

    let currenyFilter = [
      {
        $lookup: {
          from: "networks",
          localField: "network",
          foreignField: "_id",
          as: "network",
        },
      },
      { $unwind: { path: "$network", preserveNullAndEmptyArrays: true } },
      { $match: matchFilter },
      { $sort: sort },
    ];

    cabns = await db.CurrencyAddressesByNetwork.aggregate(currenyFilter);

    if (cabns && cabns.length > 0) {
      let cabn = cabns[0];
      if (cabn && cabn.currency) {
        finalMatchFilter.$and = [];
        finalMatchFilter.$and.push({
          $and: [
            { "currency._id": new mongoose.Types.ObjectId(cabn.currency) },
          ],
        });
      }
    } else {
      return res.http400(
        await commonFunctions.getValueFromStringsPhrase(
          stringHelper.strErrorBackendNoCurrencyFoundAgainstTokenAddress
        ),
        stringHelper.strErrorBackendNoCurrencyFoundAgainstTokenAddress
      );
    }

    let commonFilter = [
      {
        $lookup: {
          from: "networks",
          localField: "network",
          foreignField: "_id",
          as: "network",
        },
      },
      { $unwind: { path: "$network", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "networkDexes",
          localField: "networkDex",
          foreignField: "_id",
          as: "networkDex",
        },
      },
      { $unwind: { path: "$networkDex", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "currencies",
          localField: "currency",
          foreignField: "_id",
          as: "currency",
        },
      },
      { $unwind: { path: "$currency", preserveNullAndEmptyArrays: true } },
      { $match: finalMatchFilter },
      { $sort: sort },
    ];

    if (req.query.isPagination != null && req.query.isPagination == "false") {
      filter = [...commonFilter];
    } else {
      filter = [
        ...commonFilter,
        { $skip: req.query.offset ? parseInt(req.query.offset) : 0 },
        { $limit: req.query.limit ? parseInt(req.query.limit) : 10 },
      ];
    }

    cabns = await db.CurrencyAddressesByNetwork.aggregate(filter);

    return res.http200({
      currencyAddressesByNetworks: cabns,
    });
  });

  router.get("/cabn/bulk/list", async (req: any, res: any) => {
    let filter: any[] = [];
    const query: { [key: string]: any } = {};
    const embeddedDocumentQuery: { [key: string]: any } = {};

    if (req.query.network) {
      query["network"] = new mongoose.Types.ObjectId(req.query.network);
    }
    if (req.query.tokenContractAddress) {
      query["tokenContractAddress"] =
        req.query.tokenContractAddress.toLowerCase();
    }
    if (req.query.isAllowedOnMultiSwap === "true") {
      query["isAllowedOnMultiSwap"] = true;
    } else if (req.query.isAllowedOnMultiSwap === "false") {
      query["isAllowedOnMultiSwap"] = false;
    }

    if (
      Object.keys(query).length &&
      req.query.network &&
      req.query.priority === "true"
    ) {
      filter = [
        {
          $facet: {
            prioritySorted: [
              {
                $match: {
                  priority: { $exists: true, $ne: 0 },
                  network: mongoose.Types.ObjectId(req.query.network),
                },
              },
              { $sort: { priority: 1 } },
            ],
            alphabeticalSorted: [
              {
                $match: {
                  priority: { $exists: false },
                  network: mongoose.Types.ObjectId(req.query.network),
                },
              },
              { $sort: { name: 1 } },
            ],
          },
        },
        {
          $project: {
            items: {
              $concatArrays: ["$prioritySorted", "$alphabeticalSorted"],
            },
          },
        },
        {
          $unwind: {
            path: "$items",
            preserveNullAndEmptyArrays: true,
          },
        },
        { $replaceRoot: { newRoot: "$items" } },
      ];
    } else if (Object.keys(query).length) {
      filter = [
        {
          $match: {
            ...query,
          },
        },
      ];
    }

    filter = [
      ...filter,
      {
        $lookup: {
          from: "networks",
          localField: "network",
          foreignField: "_id",
          as: "network",
        },
      },
      { $unwind: { path: "$network", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "currencies",
          localField: "currency",
          foreignField: "_id",
          as: "currency",
        },
      },
      { $unwind: { path: "$currency", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          tokenContractAddress: 1,
          isActive: 1,
          priority: 1,
          isAllowedOnMultiSwap: 1,
          "network._id": 1,
          "network.name": 1,
          "network.nameInLower": 1,
          "network.networkShortName": 1,
          "network.logo": 1,
          "network.chainId": 1,
          "network.isNonEVM": 1,
          "network.multiSwapFiberRouterSmartContractAddress": 1,
          "currency.name": 1,
          "currency.nameInLower": 1,
          "currency.symbol": 1,
          "currency.logo": 1,
        },
      },
    ];

    if (req.query.chainId) {
      embeddedDocumentQuery["network.chainId"] = req.query.chainId;
    }
    if (req.query.search) {
      const reg = new RegExp(req.query.search, "i");
      embeddedDocumentQuery.$or = [
        { "currency.name": reg },
        { "currency.nameInLower": reg },
        { "currency.symbol": reg },
        { tokenContractAddress: reg },
      ];
    }

    if (Object.keys(embeddedDocumentQuery).length) {
      filter.push({
        $match: {
          ...embeddedDocumentQuery,
        },
      });
    }

    if (req.query.isPagination && req.query.isPagination == "true") {
      filter = [
        ...filter,
        { $skip: req.query.offset ? parseInt(req.query.offset) : 0 },
        { $limit: req.query.limit ? parseInt(req.query.limit) : 10 },
      ];
    }

    const cabns = await db.CurrencyAddressesByNetwork.aggregate(filter);

    return res.http200({
      length: cabns.length,
      currencyAddressesByNetworks: cabns,
    });
  });
};
