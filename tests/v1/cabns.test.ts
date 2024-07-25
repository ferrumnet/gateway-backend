import { baseURL } from "../constants/constants";
const validApiUrl = "/api/v1/currencies/cabn/bulk/list";
const inValidApiUrl = "/api/v1/currencies/cabn/bulk/nonexistent";
var request = require("supertest");

describe(`GET ${validApiUrl}`, () => {
  it("should return a list of cabn allowed on MultiSwap", async () => {
    const res = await request(baseURL)
      .get(validApiUrl)
      .query({ isAllowedOnMultiSwap: "true" });
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("currencyAddressesByNetworks");
  });

  it("should return a list of cabn not allowed on MultiSwap", async () => {
    const res = await request(baseURL)
      .get(validApiUrl)
      .query({ isAllowedOnMultiSwap: "false" });
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("currencyAddressesByNetworks");
  });

  it("should return all cabn when isAllowedOnMultiSwap is not provided", async () => {
    const res = await request(baseURL).get(validApiUrl);
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("currencyAddressesByNetworks");
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
