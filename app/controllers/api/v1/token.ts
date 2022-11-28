import e from "express";

module.exports = function (router: any) {

  router.put('/refresh', async (req: any, res: any) => {

    try{

      if (req.headers.authorization) {
        let token = req.headers.authorization.split(' ')[1];
        let decoded = (global as any).commonFunctions.decodeAPiToken(token);
        let user = await db.Users.findOne({ _id: decoded._id});
        return res.http200({
          token: user.createAPIToken(user)
        });
      }

    }catch(e){
      console.log(e);
    }

    return res.http401('Invalid token');
  });

};
