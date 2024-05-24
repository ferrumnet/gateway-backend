export const getUserReferral = async (userId: any) => {
  const referral = await db.Referrals.findOne({ user: userId });
  return referral;
};
export const generateUniqueReferralCode = () => {
  const timestamp = Date.now().toString(36); // Convert current timestamp to base36 string
  const randomString = Math.random().toString(36).substring(2, 5); // Generate a random string
  const referralCode = timestamp + randomString; // Concatenate timestamp and random string
  return referralCode;
};
