module.exports = function (router: any) {
  router.get("/by/sitename/:siteName", async (req: any, res: any) => {
    let filter = {};
    filter = { siteName: req.params.siteName };

    let organizationId = await db.Organizations.findOne(filter).distinct("_id");
    let organizationWhiteLables = await db.OrganizationWhiteLables.findOne({
      createdByOrganization: organizationId,
    });

    return res.http200({
      organizationWhiteLables: organizationWhiteLables,
    });
  });

  router.get("/by/type/:type", async (req: any, res: any) => {
    let filter = {};
    filter = { type: req.params.type };

    let organizationWhiteLables = await db.OrganizationWhiteLables.findOne(
      filter
    );

    return res.http200({
      organizationWhiteLables: organizationWhiteLables,
    });
  });
};
