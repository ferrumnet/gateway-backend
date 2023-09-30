var mongoose = require("mongoose");

module.exports = function (router: any) {
    router.get("/",  async (req: any, res: any) => {
        let fee = await db.CrucibleFees.find()
        return res.http200({ fee })
    })

    router.get("/:cabn",  async (req: any, res: any) => {
        let cabn = req.params.cabn
        let fee = await db.CrucibleFees.find({cabn: cabn})
        return res.http200({
            data: fee
        });
    })
}