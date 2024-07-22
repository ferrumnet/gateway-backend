import { baseURL } from "../constants/constants";
const validTokenApiUrl = "/api/v1/application-user/token";
const inValidTokenApiUrl = "/api/v1/application-user/tokens";
const validConnectApiUrl =
  "/api/v1/application-user/addresses/connect/to/address";
const inValidConnectApiUrl =
  "/api/v1/application-user/addresses/connect/to/addresses";
const encodedApplicationUserApiKey =
  "U2FsdGVkX18unxNjH8nQdcXKdl6kWsnv+D04fPUMTqGvcUIosWk1yo3eoowbKCkh8+cqquyVySG7x7FX00MeeQ==";
let token = "";
const role = "communityMember";
const address = "0xeEDFDd620629C7432970d22488124fC92Ad6D426";
const chainId = 8453;
var request = require("supertest");

describe("API Endpoint Testing", () => {
  it("should return a successful res for valid API key", async () => {
    const res = await request(baseURL)
      .get(validTokenApiUrl)
      .set("apikey", encodedApplicationUserApiKey);
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("token");
    token = res?.body?.body?.token;
  });

  it("should return an error for missing API key", async () => {
    const res = await request(baseURL).get(validTokenApiUrl);
    expect(res.statusCode).toEqual(400);
  });

  it("should return an error for invalid API key", async () => {
    const res = await request(baseURL)
      .get(validTokenApiUrl)
      .set("apikey", "invalid-api-key");
    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toHaveProperty("message");
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL).get(inValidTokenApiUrl);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL).post(validTokenApiUrl);
    expect(res.statusCode).toEqual(404);
  });
});

describe("POST API Endpoint Testing", () => {
  it("should connect address successfully with valid data", async () => {
    const res = await request(baseURL)
      .post(validConnectApiUrl)
      .query({ isFromOrganizationAdminPath: false })
      .set("Authorization", `Bearer ${token}`)
      .send({
        address: address,
        ferrumNetworkIdentifier: chainId,
        role: role,
      });

    expect(res.statusCode).toEqual(200);
  });

  it("should return an error with invalid token", async () => {
    const res = await request(baseURL)
      .post(validConnectApiUrl)
      .query({ isFromOrganizationAdminPath: false })
      .set("Authorization", "Bearer invalid_token")
      .send({
        address: address,
        ferrumNetworkIdentifier: chainId,
        role: role,
      });
    expect(res.statusCode).toEqual(401);
  });

  it("should return an error with missing required fields", async () => {
    const res = await request(baseURL)
      .post(validConnectApiUrl)
      .query({ isFromOrganizationAdminPath: false })
      .set("Authorization", `Bearer ${token}`)
      .send({
        // Missing address field
        ferrumNetworkIdentifier: chainId,
        role: role,
      });
    expect(res.statusCode).toEqual(400);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .post(inValidConnectApiUrl)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (GET)", async () => {
    const res = await request(baseURL)
      .get(validConnectApiUrl)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(404);
  });
});
