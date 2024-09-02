var mongoose = require("mongoose");
var { recoverPersonalSignature } = require("eth-sig-util");

module.exports = function (router: any) {
  router.post("/connect/to/address", async (req: any, res: any) => {
    let addressObject = null;

    if (
      !req.body.address ||
      !req.body.ferrumNetworkIdentifier ||
      !req.body.role
    ) {
      return res.http400(
        "address & ferrumNetworkIdentifier and role are required."
      );
    }

    let address = await addressesHelper.getAddress(req, res, false);
    if (address && address.length > 0) {
      addressObject = address[0];
    } else {
      let network = await db.Networks.findOne({
        ferrumNetworkIdentifier: req.body.ferrumNetworkIdentifier,
      });
      if (network) {
        let address = await addressesHelper.getAddress(req, res, false, true);
        if (address && address.length > 0) {
          address = address[0];
        }
        addressObject = await addressesHelper.genrateNonceByABN(
          req,
          res,
          address,
          network
        );
        addressObject.network = network;
      }
    }
    if (addressObject && addressObject.network) {
      try {
        let response = await addressesHelper.createUserByABN(
          req,
          res,
          addressObject
        );
        console.log(req.query.isFromOrganizationAdminPath);
        if (
          req.query.isFromOrganizationAdminPath &&
          req.query.isFromOrganizationAdminPath == "true"
        ) {
          let resObject = await addressesHelper.checkForOrganizationAdmin(
            response
          );
          if (resObject && resObject.message) {
            return res.http400(resObject.message);
          }
          response = resObject;
        }
        return res.http200(response);
      } catch (err: any) {
        return res.http400(err.message);
      }
    }

    return res.http400(
      await commonFunctions.getValueFromStringsPhrase(
        stringHelper.strAddressNotFound
      ),
      stringHelper.strAddressNotFound
    );
  });
};
