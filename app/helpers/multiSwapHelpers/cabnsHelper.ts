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
  let countFilter: any = {};
  const userId = req.user._id;
  const networkId = await db.Networks.countDocuments({
    chainId: req.body.chainId,
  });
  if (!networkId) {
    throw stringHelper.chainIdNotSupported;
  }
};

const countCabnByFilter = async (filter: any): Promise<any> => {
  return await db.CurrencyAddressesByNetwork.countDocuments(filter);
};
