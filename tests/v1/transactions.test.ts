var request = require("supertest");
import { baseURL } from "../constants/constants";
import { sessionToken } from "./session.test";
const validPrivateTransactionListApiUrl =
  "/api/v1/community-member/multiSwap/transactions/list";
const inValidPrivateTransactionListApiUrl =
  "/api/v1/community-member/multiSwap//transactions/lists";
const validPublicTransactionListApiUrl =
  "/api/v1/swapTransactions/transactions/list";
const inValidPublicTransactionListApiUrl =
  "/api/v1//swapTransactions/transactions/lists";

describe("API Endpoint Testing", () => {
  it("should return a list of transactions with status 200", async () => {
    const res = await request(baseURL)
      .get(validPrivateTransactionListApiUrl)
      .set("Authorization", `Bearer ${sessionToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("swapAndWithdrawTransactions");
  });

  it("should return an error for invalid token", async () => {
    const res = await request(baseURL)
      .get(validPrivateTransactionListApiUrl)
      .set("Authorization", "invalid-api-key");
    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toHaveProperty("message");
  });

  it("should return an error for missing token", async () => {
    const res = await request(baseURL).get(validPrivateTransactionListApiUrl);
    console.log(res);
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(inValidPrivateTransactionListApiUrl)
      .set("Authorization", `Bearer ${sessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(validPrivateTransactionListApiUrl)
      .set("Authorization", `Bearer ${sessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should return a list of transactions with status 200", async () => {
    const res = await request(baseURL).get(validPublicTransactionListApiUrl);
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("swapAndWithdrawTransactions");
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL).get(inValidPublicTransactionListApiUrl);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL).post(validPublicTransactionListApiUrl);
    expect(res.statusCode).toEqual(404);
  });
});
