const { db } = global;

const create = async (reqBody, createBy) => {
  let payload = {};
  payload.name = reqBody.name;
  payload.createdBy = createBy;
  return await db.Product.create(payload);
};

const updateById = async (_id, name, createdBy) => {
  const filter = { _id };
  let payload = { name, createdBy };
  return await db.Product.findOneAndUpdate(filter, payload, { new: true });
};

const updateActivationById = async (req) => {
  const filter = { _id: req.params.id };
  let payload = {};
  payload.isActive = req.body.active;
  return await db.Product.findOneAndUpdate(filter, payload, { new: true });
};

const getById = async (_id) => {
  const filter = { _id };
  return await db.Product.findOne(filter);
};

const countById = async (_id) => {
  const filter = { _id };
  return await db.Product.countDocuments(filter);
};

const queryProducts = async (filter, options) => {
  return await db.Product.paginate(filter, options);
};

module.exports = {
  queryProducts,
  create,
  updateById,
  getById,
  countById,
  updateActivationById,
};
