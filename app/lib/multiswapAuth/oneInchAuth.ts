import {
  getUser,
  invalidRequest,
  oneInchDecodeToken,
  Response,
} from "../../helpers/authHelpers/rootAuthHelper";
const AUTHORIZATION_MISSING = "Authorization header missing";

module.exports = function () {
  return async function (req: any, res: any, next: any) {
    if (!req.headers.authorization) {
      return res.http401(AUTHORIZATION_MISSING);
    }

    try {
      let response: Response = oneInchDecodeToken(req);
      if (!response?.isValid) {
        return invalidRequest(res);
      }
      next();
    } catch (error) {
      console.log(error);
      return invalidRequest(res);
    }
  };
};
