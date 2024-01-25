let db = require("../../models/index");
let stringHelper = require("../../helpers/stringHelper");
export const doValidationForCreateUserCabn = async (req: any): Promise<any> => {
  if (
    !req.body.tokenContractAddress ||
    !req.body.chainId ||
    !req.body.currencyName ||
    !req.body.currencySymbol
  ) {
    throw "tokenContractAddress & chainId & currencyName and currencySymbol are required.";
  }
};

export const createUserCabn = async (req: any): Promise<any> => {
  let cabnFilter: any = {};
  const userId = req.user._id;
  const network = await db.Networks.findOne({
    chainId: req.body.chainId,
  });
  if (!network) {
    throw stringHelper.chainIdNotSupported;
  }
  req.body.tokenContractAddress = req.body.tokenContractAddress.toLowerCase();
  cabnFilter.network = network._id;
  cabnFilter.tokenContractAddress = req.body.tokenContractAddress;
  console.log("cabn count", await countCabnByFilter(cabnFilter));
  if ((await countCabnByFilter(cabnFilter)) == 0) {
    req.body.nonDefaultCurrencyInformation =
      getNonDefaultCurrencyInformationObject(req.body);
    req.body.createdByusers = [userId];
    req.body.network = network._id;
    req.body.isAllowedOnMultiSwap = true;
    req.body.isDefault = false;
    req.body.createdAt = new Date();
    req.body.updatedAt = new Date();
    return await db.CurrencyAddressesByNetwork.create(req.body);
  } else {
    return addUserIdIntoCabn(cabnFilter, req);
  }
};

const countCabnByFilter = async (cabnFilter: any): Promise<any> => {
  console.log(cabnFilter);
  return await db.CurrencyAddressesByNetwork.countDocuments(cabnFilter);
};

const findCabnByFilter = async (cabnFilter: any): Promise<any> => {
  console.log(cabnFilter);
  return await db.CurrencyAddressesByNetwork.findOne(cabnFilter);
};

const getNonDefaultCurrencyInformationObject = (body: any): any => {
  return {
    name: body.currencyName,
    symbol: body.currencySymbol,
  };
};

const addUserIdIntoCabn = async (cabnFilter: any, req: any): Promise<any> => {
  let cabn;
  cabnFilter.createdByusers = { $in: req.user._id };
  let byPass = true;
  if ((await countCabnByFilter(cabnFilter)) == 0 || byPass) {
    delete cabnFilter.createdByusers;
    cabn = await findCabnByFilter(cabnFilter);
    if (cabn) {
      let users = cabn.createdByusers;
      users.push(req.user._id);
      cabn.createdByusers = users;
      cabn.updatedAt = new Date();
      cabn = await db.CurrencyAddressesByNetwork.findOneAndUpdate(
        cabnFilter,
        cabn,
        { new: true }
      );
    }
  }
  return cabn ? cabn : await findCabnByFilter(cabnFilter);
};
