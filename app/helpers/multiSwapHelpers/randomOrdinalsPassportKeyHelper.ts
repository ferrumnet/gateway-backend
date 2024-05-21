let stringHelper = (global as any).stringHelper;
const TAGS = [
  "BadKarma",
  "ShadowPulse",
  "NeoBlade",
  "YellowSnowman",
  "BlueSnowman",
  "HeartTicker",
  "Crazy-Cat-Lady",
  "unfriendme",
  "Babushka",
  "SaintBroseph",
  "iNeed2p",
  "FrostedCupcake",
];

export const saveRandomKeys = async (data: any) => {
  let count = await db.RandomOrdinalsPassportKeys.countDocuments({});
  for (let item of data) {
    if (item && (await isNewRandomKey(item))) {
      count = count + 1;
      let body = {
        tag: getTag(count),
        key: item,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.RandomOrdinalsPassportKeys.create(body);
    }
  }
};

export const attachAddressWithRandomKey = async (address: string) => {
  let keyItem = await db.RandomOrdinalsPassportKeys.findOne({
    address: address,
  });
  if (keyItem) {
    return keyItem;
  }
  let data = await db.RandomOrdinalsPassportKeys.findOne({ address: "" });
  if (!data) {
    throw stringHelper.strErrorNoRandmonKeyAvailable;
  }
  data = await db.RandomOrdinalsPassportKeys.findOneAndUpdate(
    { _id: data._id },
    { address: address },
    { new: true }
  );
  return data;
};

export const findRandomKeyByTag = async (tag: string) => {
  let data = await db.RandomOrdinalsPassportKeys.findOne({ tag: tag });
  return data;
};

const isNewRandomKey = async (key: any): Promise<boolean> => {
  let count = await db.RandomOrdinalsPassportKeys.countDocuments({ key: key });
  return count > 0 ? false : true;
};

const getTag = (count: number): string => {
  let index = 0;
  try {
    index = Math.floor(Math.random() * TAGS.length);
    index = index < TAGS.length ? index : 0;
  } catch (e) {}
  return `${TAGS[index]}-${count}`;
};
