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

    router.put("/:cabn",  async (req: any, res: any) => {
        let cabn = req.params.cabn
        let fee = await db.CrucibleFees.findOneAndUpdate({cabn: cabn}, {
            ...req.body
         }, { new: true });
         
        return res.http200({
            data: fee
        });
    })

    router.post("/",  async (req: any, res: any) => {
        let fees = await db.CrucibleFees.create(req.body)
        return res.http200({
            crucibleFees: fees
        });
    })
}