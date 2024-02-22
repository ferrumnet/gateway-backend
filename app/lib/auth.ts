import {
  decodeToken,
  getUser,
  invalidRequest,
  Response,
} from "../helpers/authHelpers/rootAuthHelper";
const AUTHORIZATION_MISSING = "Authorization header missing";

module.exports = function () {
  return async function (req: any, res: any, next: any) {
    if (!req.headers.authorization) {
      return res.http401(AUTHORIZATION_MISSING);
    }

    try {
      let response: Response = decodeToken(req);
      if (!response?.isValid) {
        return invalidRequest(res);
      }

      if (!response?.isFromNodeInfra) {
        const user = await getUser(response.id);
        if (!user) {
          return invalidRequest(res);
        }
        req.user = user;
      }
      next();
    } catch (error) {
      console.log(error);
      return invalidRequest(res);
    }
  };
};
