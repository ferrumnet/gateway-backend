import { baseURL } from "../constants/constants";
const validApiUrl = "/api/v1/wallets/wbn/list";
const inValidApiUrl = "/api/v1/wallets/wbn/nonexistent";
var request = require("supertest");

describe(`GET ${validApiUrl}`, () => {
  it("should return a list of wallets with status 200", async () => {
    const res = await request(baseURL).get(validApiUrl);
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("walletByNetworks");
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL).get(inValidApiUrl);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL).post(validApiUrl);
    expect(res.statusCode).toEqual(404);
  });
});
