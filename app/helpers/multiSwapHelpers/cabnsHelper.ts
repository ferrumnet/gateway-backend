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
  await checkDefaultCabnAlreadyExist({ ...cabnFilter, isDefault: true });
  if ((await countCabnByFilter(cabnFilter)) == 0) {
    req.body.nonDefaultCurrencyInformation =
      getNonDefaultCurrencyInformationObject(req.body);
    req.body.createdByusers = [userId];
    req.body.network = network._id;
    req.body.isAllowedOnMultiSwap = true;
    req.body.isDefault = false;
    req.body.priority = 1;
    req.body.createdAt = new Date();
    req.body.updatedAt = new Date();
    return await db.CurrencyAddressesByNetwork.create(req.body);
  } else {
    return addUserIdIntoCabn(cabnFilter, req);
  }
};

export const deleteUserIdFromAllCabns = async (user: any): Promise<any> => {
  let cabnFilter: any = {};
  cabnFilter.createdByusers = { $in: user._id };
  cabnFilter.isDefault = false;
  let cabns = await db.CurrencyAddressesByNetwork.find(cabnFilter);
  if (cabns && cabns.length > 0) {
    for (let cabn of cabns) {
      await deleteUserIdFromCabn(user, cabn._id);
    }
  }
};

export const deleteUserIdFromCabn = async (
  user: any,
  cabnId: string
): Promise<any> => {
  let cabnFilter: any = {};
  cabnFilter.createdByusers = { $in: user._id };
  cabnFilter._id = cabnId;
  cabnFilter.isDefault = false;
  let cabn = await findCabnByFilter(cabnFilter);
  if (cabn) {
    let users = cabn.createdByusers;
    users = removeItemFromList(users, user._id);
    cabn.createdByusers = users;
    cabn.updatedAt = new Date();
    cabn = await db.CurrencyAddressesByNetwork.findOneAndUpdate(
      cabnFilter,
      cabn,
      { new: true }
    );
  }
};

export const checkDefaultCabnAlreadyExist = async (
  cabnFilter: any
): Promise<any> => {
  if ((await countCabnByFilter(cabnFilter)) > 0) {
    throw await commonFunctions.getValueFromStringsPhrase(
      stringHelper.strErrorCabnAlreadyExist
    );
  }
};

export const makeCabnDefault = async (cabnId: string): Promise<any> => {
  let cabnFilter: any = {};
  cabnFilter._id = cabnId;
  cabnFilter.isDefault = false;
  let cabn = await findCabnByFilter(cabnFilter);
  if (cabn) {
    cabn.createdByusers = [];
    cabn.isDefault = true;
    cabn.updatedAt = new Date();
    cabn = await db.CurrencyAddressesByNetwork.findOneAndUpdate(
      cabnFilter,
      cabn,
      { new: true }
    );
  }
};

const removeItemFromList = (arr: any, value: any) => {
  var i = 0;
  while (i < arr.length) {
    if (arr[i].toString() == value.toString()) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
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
  if ((await countCabnByFilter(cabnFilter)) == 0) {
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
