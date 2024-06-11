module.exports = {
  async createCurrencyAddresses(req: any, model: any, body: any) {
    let results = [];
    if (model && body.networks && body.networks.length > 0) {
      for (let i = 0; i < body.networks.length; i++) {
        let organization = "";
        if (body.networks[i].tokenContractAddress) {
          body.networks[i].tokenContractAddress =
            body.networks[i].tokenContractAddress.toLowerCase();
        }
        if (req.user && req.user.organization) {
          organization = req.user.organization;
        } else {
          organization = req.body.organization;
        }
        let innerBody = {
          network: body.networks[i].network,
          currency: model._id,
          networkDex: body.networks[i].networkDex,
          tokenContractAddress: body.networks[i].tokenContractAddress,
          createdByOrganization: organization,
        };
        let result = await db.CurrencyAddressesByNetwork.create(innerBody);
        results.push(result._id);
        // let count = await db.CurrencyAddressesByNetwork.count({ network: body.networks[i].network, currency: model._id })
        // if (count == 0) {
        // }
      }
    }

    return results;
  },
  async currencyAssociationWithNetwork(req: any, res: any) {
    var filter = { networkCurrencyAddressByNetwork: req.params.id };
    return await db.Networks.countDocuments(filter);
  },
  async currencyAssociationWithLeaderboardssss(req: any, res: any) {
    var filter = { networkCurrencyAddressByNetwork: req.params.id };
    return await db.LeaderboardCurrencyAddressesByNetwork.countDocuments(
      filter
    );
  },
  async currencyAssociationWithLeaderboard(req: any, res: any) {
    var filter = { currency: req.params.id };
    var cabnIds = await db.CurrencyAddressesByNetwork.find(filter).distinct(
      "_id"
    );
    return await db.LeaderboardCurrencyAddressesByNetwork.countDocuments({
      currencyAddressesByNetwork: { $in: cabnIds },
    });
  },
  async currencyAssociationWithTokenHoldersBalanceSnapshots(
    req: any,
    res: any
  ) {
    var filter = { currency: req.params.id };
    var cabnIds = await db.CurrencyAddressesByNetwork.find(filter).distinct(
      "_id"
    );
    return await db.TokenHoldersBalanceSnapshots.countDocuments({
      currencyAddressesByNetwork: { $in: cabnIds },
    });
  },
  async validateCabnToAddBaseFeeToken(
    req: any,
    res: any,
    isFromUpdate = false
  ) {
    let filter: any = {};
    filter.network = req.body.networkId;
    filter.isBaseFeeToken = true;
    if (isFromUpdate) {
      filter._id = { $ne: req.body.oldCabnId };
    }
    return await db.CurrencyAddressesByNetwork.countDocuments(filter);
  },
  async createBulkCabns(req: any, res: any) {
    await this.validationCreateBulkCabns(req, res);
    req = await this.createCurrencyObjectsForBulkCabns(req);
    console.log(req.body.cabns);
    for (let i = 0; i < req.body.cabns.length; i++) {
      let cabn = await this.createCabnFromBulk(req, req.body.cabns[i]);
      let currency = await db.Currencies.findOne({ _id: cabn.currency });
      if (currency) {
        currency.currencyAddressesByNetwork.push(cabn?._id);
        currency = await db.Currencies.findOneAndUpdate(
          { _id: currency._id },
          { currencyAddressesByNetwork: currency.currencyAddressesByNetwork },
          { new: true }
        );
      }
    }
    return "";
  },
  async validationCreateBulkCabns(req: any, res: any) {
    if (!req.body.network || !req.body.cabns) {
      throw "network & cabns are required.";
    }
    if (req.body.cabns.length == 0) {
      throw "cabns are required.";
    }
    for (let i = 0; i < req.body.cabns.length; i++) {
      let address = req.body.cabns[i].tokenContractAddress;
      req.body.cabns[i].tokenContractAddress = address
        ? address.toLowerCase()
        : "";
      req.body.cabns[i].network = req.body.network;
      req.body.cabns[i].networkDex = req.body.networkDex;
      req.body.cabns[i].isCreatedFromBulk = true;
      req.body.cabns[i].isAllowedOnMultiSwap = true;
    }
    req.body.networks = req.body.cabns;
    let error = await commonFunctions.validationForUniqueCBN(req, res);
    if (error) {
      throw error;
    }
  },
  async createCurrencyObjectsForBulkCabns(req: any) {
    for (let i = 0; i < req.body.cabns.length; i++) {
      let currencySymbol = req.body.cabns[i].currencySymbol;
      let currency = await this.getCurrentByShortName(currencySymbol);
      if (!currency) {
        let currencyBody: any = {};
        currencyBody.createdByUser = req.user._id;
        currencyBody.updatedByUser = req.user._id;
        currencyBody.name = req.body.cabns[i].currencyName
          ? req.body.cabns[i].currencyName
          : "";
        currencyBody.nameInLower = req.body.cabns[i].currencyName
          ? req.body.cabns[i].currencyName.toLowerCase()
          : "";
        currencyBody.logo = req.body.cabns[i].currencyLogo;
        currencyBody.symbol = req.body.cabns[i].currencySymbol;
        currencyBody.isCreatedFromBulk = true;
        currencyBody.isVisibleForPublicMenuItem = false;
        currencyBody.createdByOrganization = req.user.organization;
        currencyBody.createdAt = new Date();
        currencyBody.updatedAt = new Date();
        currency = await db.Currencies.create(currencyBody);
      }
      req.body.cabns[i].currency = currency._id;
      req.body.cabns[i].dynamicDecimals = req.body.cabns[i].decimals;
    }
    return req;
  },
  async getCurrentByShortName(currencySymbol: string) {
    return await db.Currencies.findOne({ symbol: currencySymbol });
  },
  async createCabnFromBulk(req: any, cabn: any) {
    let cabnBody: any = {};
    cabnBody = { ...cabn };
    cabnBody.createdByUser = req.user._id;
    cabnBody.createdByOrganization = req.user.organization;
    cabnBody.createdAt = new Date();
    let result = await db.CurrencyAddressesByNetwork.create(cabnBody);
    console.log("cabnBody", result);
    return result;
  },
};
