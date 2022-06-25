var jwt = require("jsonwebtoken");

module.exports = () => (req: any, res: any, next: any) => {
  try {
    if (req.headers.authorization && req.headers["profile-authorization"]) {
      const jwtSecret = (global as any).environment.jwtSecret;
      const profileToken = req.headers["profile-authorization"];
      const authToken = req.headers.authorization.split(" ")[1];
      const profileDecoded = jwt.verify(profileToken, jwtSecret);

      if (profileDecoded) {
        if (profileDecoded.token === authToken) {
          return next();
        }
      }
      return res.http401("Invalid token");
    }
    return res.http401("Authorization header missing");
  } catch (error) {
    (global as any).log.error(error);
    return res.http401("Invalid token");
  }
};
