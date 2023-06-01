module.exports = function (router: any) {
  router.post("/create", async (req: any, res: any) => {
    if (!req.body.backgroundImage || !req.body.tittle || !req.body.type) {
      return res.http400("backgroundImage & tittle & type are required.");
    }

    req.body.createdByUser = req.user._id;
    req.body.updatedByUser = req.user._id;
    if (req.body.organization) {
      req.body.createdByOrganization = req.body.organizationId;
    }
    req.body.createdAt = new Date();
    req.body.updatedAt = new Date();

    let organizationWhiteLables = await db.OrganizationWhiteLables.create(
      req.body
    );

    return res.http200({
      organizationWhiteLables: organizationWhiteLables,
    });
  });

  router.get("/list", async (req: any, res: any) => {
    var filter = {};

    let organizationWhiteLables = await db.OrganizationWhiteLables.find(filter)
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10);

    return res.http200({
      organizationWhiteLables: organizationWhiteLables,
    });
  });

  router.get("/:id", async (req: any, res: any) => {
    let filter = {};
    filter = { _id: req.params.id };

    let organizationWhiteLables = await db.OrganizationWhiteLables.findOne(
      filter
    );

    return res.http200({
      organizationWhiteLables: organizationWhiteLables,
    });
  });
};
