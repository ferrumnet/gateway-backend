var jwt = require("jsonwebtoken");
import { getKey, isTokenValid } from "../authHelpers/nodeInfraAuthHelper";
const INVALID_TOKEN = "Invalid token";

export interface Response {
  isFromNodeInfra: boolean;
  isValid: boolean;
  id: string;
}

export const decodeToken = (req: any): Response => {
  const token = req.headers.authorization.split(" ")[1];
  return filterRoutesAndVerify(token ? token : "", req.originalUrl);
};

const filterRoutesAndVerify = (token: string, url: string): Response => {
  let authResponse: Response = {
    isFromNodeInfra: false,
    isValid: false,
    id: "",
  };

  if (url.includes("/v1/transactions/")) {
    let key = getKey(url);
    if (isTokenValid(token, key)) {
      authResponse.isFromNodeInfra = true;
      authResponse.isValid = true;
    }
  } else {
    const decoded = jwt.verify(token, (global as any).environment.jwtSecret);
    if (decoded) {
      authResponse.isValid = true;
      authResponse.id = decoded._id;
    }
  }
  return authResponse;
};

export const getUser = async (id: string) => {
  return await db.Users.findOne({
    _id: id,
  });
};

export const invalidRequest = async (res: any) => {
  return res.http401(INVALID_TOKEN);
};
