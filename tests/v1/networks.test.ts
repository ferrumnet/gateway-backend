import { baseURL } from "../constants/constants";
const validApiUrl = "/api/v1/networks/list";
const inValidApiUrl = "/api/v1/network/nonexistent";
var request = require("supertest");

describe(`GET ${validApiUrl}`, () => {
  it("should return a list of networks allowed on MultiSwap", async () => {
    const res = await request(baseURL)
      .get(validApiUrl)
      .query({ isAllowedOnMultiSwap: "true" });
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("networks");
  });

  it("should return a list of networks not allowed on MultiSwap", async () => {
    const res = await request(baseURL)
      .get(validApiUrl)
      .query({ isAllowedOnMultiSwap: "false" });
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("networks");
  });

  it("should return all networks when isAllowedOnMultiSwap is not provided", async () => {
    const res = await request(baseURL).get(validApiUrl);
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("networks");
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
