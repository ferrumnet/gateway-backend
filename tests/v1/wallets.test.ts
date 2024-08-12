var request = require("supertest");
import { baseURL } from "../constants/constants";
import { superAdminSessionToken } from "./users.test";
const validApiUrl = "/api/v1/wallets/wbn/list";
const inValidApiUrl = "/api/v1/wallets/wbn/nonexistent";
const validWalletsApiUrl = "/api/v1/super-admin/wallets/list";
const inValidWalletsApiUrl = "/api/super-admin/wallet/list";
const validWalletByIdApiUrl = "/api/v1/super-admin/wallets/";
const inValidWalletByIdApiUrl = "/api/super-admin/wallet/";
const validCreateWalletApiUrl = "/api/v1/super-admin/wallets/create";
const inValidCreateWalletApiUrl = "/api/super-admin/wallet/create";
const validUpdateWalletApiUrl = "/api/v1/super-admin/wallets/update/";
const inValidUpdateWalletApiUrl = "/api/super-admin/wallet/update/";

const validWbnIdnsApiUrl = "/api/v1/super-admin/wallets/wbn/list";
const inValidWbnIdnsApiUrl = "/api/super-admin/wallet/wbn/list";
const validWbnIdnsByIdApiUrl = "/api/v1/super-admin/wallets/wbn/";
const inValidWbnIdnsByIdApiUrl = "/api/super-admin/wallet/wbn/";
const validCreateWbnIdnsApiUrl = "/api/v1/super-admin/wallets/wbn/create";
const inValidCreateWbnIdnsApiUrl = "/api/super-admin/wallet/wbn/create";
const validUpdateWbnByIdApiUrl =
  "/api/v1/super-admin/wallets/wbn/position/for/wallet/";
const inValidUpdateWbnByIdApiUrl =
  "/api/super-admin/wallet/wbns/position/for/wallet/";
let walletId = "";
let wbnId = "";

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

describe("API Endpoint Testing", () => {
  it("should return a list of wallets with status 200", async () => {
    const res = await request(baseURL)
      .get(validWalletsApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("wallets");
  });

  it("should return an error for invalid token", async () => {
    const res = await request(baseURL)
      .get(validWalletsApiUrl)
      .set("Authorization", "invalid-api-key");
    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toHaveProperty("message");
  });

  it("should return an error for missing token", async () => {
    const res = await request(baseURL).get(validWalletsApiUrl);
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(inValidWalletsApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(validWalletsApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should create wallet successfully", async () => {
    const res = await request(baseURL)
      .post(validCreateWalletApiUrl)
      .send({
        name: "test wallet",
        logo: "https://logo.com",
      })
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
    walletId = res.body.body.wallet._id;
  });

  it("should return an error with missing required fields", async () => {
    const res = await request(baseURL)
      .post(validCreateWalletApiUrl)
      .send({
        name: "",
        logo: "",
      })
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(400);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .post(inValidCreateWalletApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (GET)", async () => {
    const res = await request(baseURL)
      .put(validCreateWalletApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should update wallet successfully", async () => {
    const res = await request(baseURL)
      .put(`${validUpdateWalletApiUrl}${walletId}`)
      .send({
        name: "test wallet",
        logo: "https://logos.com",
      })
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it("should return an error with missing required fields", async () => {
    const res = await request(baseURL)
      .put(`${validUpdateWalletApiUrl}${walletId}`)
      .send({
        name: "",
        logo: "",
      })
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(400);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .put(`${inValidUpdateWalletApiUrl}${walletId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (GET)", async () => {
    const res = await request(baseURL)
      .post(`${validUpdateWalletApiUrl}${walletId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should return a single wallet data with status 200", async () => {
    const res = await request(baseURL)
      .get(`${validWalletByIdApiUrl}${walletId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("wallet");
  });

  it("should return an error for invalid token", async () => {
    const res = await request(baseURL)
      .get(`${validWalletByIdApiUrl}${walletId}`)
      .set("Authorization", "invalid-api-key");
    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toHaveProperty("message");
  });

  it("should return an error for missing token", async () => {
    const res = await request(baseURL).get(
      `${validWalletByIdApiUrl}${walletId}`
    );
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(`${inValidWalletByIdApiUrl}${walletId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(`${validWalletByIdApiUrl}${walletId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should delete single wallet with status 200", async () => {
    const res = await request(baseURL)
      .delete(`${validWalletByIdApiUrl}${walletId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it("should return an error for invalid token", async () => {
    const res = await request(baseURL)
      .delete(`${validWalletByIdApiUrl}${walletId}`)
      .set("Authorization", "invalid-api-key");
    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toHaveProperty("message");
  });

  it("should return an error for missing token", async () => {
    const res = await request(baseURL).delete(
      `${validWalletByIdApiUrl}+${walletId}`
    );
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .delete(`${inValidWalletByIdApiUrl}${walletId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(`${validWalletByIdApiUrl}${walletId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should return a list of wbns with status 200", async () => {
    const res = await request(baseURL)
      .get(validWbnIdnsApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("wbns");
  });

  it("should return an error for invalid token", async () => {
    const res = await request(baseURL)
      .get(validWbnIdnsApiUrl)
      .set("Authorization", "invalid-api-key");
    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toHaveProperty("message");
  });

  it("should return an error for missing token", async () => {
    const res = await request(baseURL).get(validWbnIdnsApiUrl);
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(inValidWbnIdnsApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(validWbnIdnsApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should create wbn successfully", async () => {
    const res = await request(baseURL)
      .post(validCreateWbnIdnsApiUrl)
      .send({
        wallet: "658fec008558380c17dd7efb",
        network: "61f182eb6cc928420e002401",
      })
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
    wbnId = res.body.body.wbn._id;
  });

  it("should return an error with missing required fields", async () => {
    const res = await request(baseURL)
      .post(validCreateWbnIdnsApiUrl)
      .send({
        wallet: "",
        network: "",
      })
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(400);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .post(inValidCreateWbnIdnsApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (GET)", async () => {
    const res = await request(baseURL)
      .put(validCreateWbnIdnsApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should return a single wbn data with status 200", async () => {
    const res = await request(baseURL)
      .get(`${validWbnIdnsByIdApiUrl}${wbnId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("wbn");
  });

  it("should return an error for invalid token", async () => {
    const res = await request(baseURL)
      .get(`${validWbnIdnsByIdApiUrl}${wbnId}`)
      .set("Authorization", "invalid-api-key");
    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toHaveProperty("message");
  });

  it("should return an error for missing token", async () => {
    const res = await request(baseURL).get(`${validWbnIdnsByIdApiUrl}${wbnId}`);
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(`${inValidWbnIdnsByIdApiUrl}${wbnId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(`${validWbnIdnsByIdApiUrl}${wbnId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should delete single wbn with status 200", async () => {
    const res = await request(baseURL)
      .delete(`${validWbnIdnsByIdApiUrl}${wbnId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it("should return an error for invalid token", async () => {
    const res = await request(baseURL)
      .delete(`${validWbnIdnsByIdApiUrl}${wbnId}`)
      .set("Authorization", "invalid-api-key");
    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toHaveProperty("message");
  });

  it("should return an error for missing token", async () => {
    const res = await request(baseURL).delete(
      `${validWbnIdnsByIdApiUrl}+${wbnId}`
    );
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .delete(`${inValidWbnIdnsByIdApiUrl}${wbnId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(`${validWbnIdnsByIdApiUrl}${wbnId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});
