var request = require("supertest");
import { baseURL } from "../constants/constants";
import { superAdminSessionToken } from "./users.test";
import { sessionToken } from "./session.test";
const validCreateRFMApiUrl = "/api/v1/super-admin/referralFeeManagement/create";
const inValidCreateRFMApiUrl = "/api/super-admin/referralFeeManagements/create";
const validUpdateRFMApiUrl =
  "/api/v1/super-admin/referralFeeManagement/update/";
const inValidUpdateRFMApiUrl = "/api/super-admin/referralFeeManagement/update/";
const validCreateReferralApiUrl =
  "/api/v1/community-member/multiSwap/referrals/create/referral/code";
const inValidCreateReferralApiUrl =
  "/api/community-member/multiSwap/referral/create/referral/code";
const validGetReferralApiUrl =
  "/api/v1/community-member/multiSwap/referrals/referral/code";
const inValidGetReferralApiUrl =
  "/api/community-member/multiSwap/referral/referral/code";
let rfmId = "";

describe("API Endpoint Testing", () => {
  it("should create referralFeeManagements successfully", async () => {
    const res = await request(baseURL)
      .post(validCreateRFMApiUrl)
      .send({
        tier: "GeneralX",
        fee: 10,
        discount: 50,
        feeType: "PERCENTAGE",
        userAddresses: [],
      })
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
    rfmId = res.body.body.referralFeeManagement._id;
  });

  it("should return an error with missing required fields", async () => {
    const res = await request(baseURL)
      .post(validCreateRFMApiUrl)
      .send({
        tier: "",
        fee: 10,
        feeType: "",
        userAddresses: [],
      })
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(400);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .post(inValidCreateRFMApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (GET)", async () => {
    const res = await request(baseURL)
      .put(validCreateRFMApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should update referralFeeManagements successfully", async () => {
    const res = await request(baseURL)
      .put(`${validUpdateRFMApiUrl}${rfmId}`)
      .send({
        tier: "GeneralX",
        fee: 20,
        discount: 30,
        feeType: "PERCENTAGE",
        userAddresses: [],
      })
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it("should return an error with missing required fields", async () => {
    const res = await request(baseURL)
      .put(`${validUpdateRFMApiUrl}${rfmId}`)
      .send({
        tier: "",
        fee: 10,
        feeType: "",
        userAddresses: [],
      })
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(400);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .put(`${inValidUpdateRFMApiUrl}${rfmId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (GET)", async () => {
    const res = await request(baseURL)
      .post(`${validUpdateRFMApiUrl}${rfmId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should create referral successfully", async () => {
    const res = await request(baseURL)
      .post(validCreateReferralApiUrl)
      .set("Authorization", `Bearer ${sessionToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .post(inValidCreateReferralApiUrl)
      .set("Authorization", `Bearer ${sessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (PUT)", async () => {
    const res = await request(baseURL)
      .put(validCreateReferralApiUrl)
      .set("Authorization", `Bearer ${sessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should return a single referral data with status 200", async () => {
    const res = await request(baseURL)
      .get(`${validGetReferralApiUrl}`)
      .set("Authorization", `Bearer ${sessionToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("referral");
  });

  it("should return an error for invalid token", async () => {
    const res = await request(baseURL)
      .get(`${validGetReferralApiUrl}`)
      .set("Authorization", "invalid-api-key");
    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toHaveProperty("message");
  });

  it("should return an error for missing token", async () => {
    const res = await request(baseURL).get(`${validGetReferralApiUrl}`);
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(`${inValidGetReferralApiUrl}`)
      .set("Authorization", `Bearer ${sessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(`${validGetReferralApiUrl}`)
      .set("Authorization", `Bearer ${sessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});
