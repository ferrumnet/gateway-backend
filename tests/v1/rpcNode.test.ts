var request = require("supertest");
var crypto = require("crypto");
import { baseURL } from "../constants/constants";
import { superAdminSessionToken } from "./users.test";
const validRpcNodesApiUrl = "/api/v1/super-admin/rpcNodes/list";
const inValidRpcNodesApiUrl = "/api/super-admin/rpcNode/list";
const validRpcNodeByIdApiUrl = "/api/v1/super-admin/rpcNodes/";
const inValidRpcNodeByIdApiUrl = "/api/super-admin/rpcNode/";
const validCreateRpcNodeApiUrl = "/api/v1/super-admin/rpcNodes/create";
const inValidCreateRpcNodeApiUrl = "/api/super-admin/rpcNode/create";
const validUpdateRpcNodeApiUrl = "/api/v1/super-admin/rpcNodes/update/";
const inValidUpdateRpcNodeApiUrl = "/api/super-admin/rpcNode/update/";
let rpcNodeId = "";
let address = crypto.randomBytes(10).toString("hex");

describe("API Endpoint Testing", () => {
  it("should return a list of rpc nodes with status 200", async () => {
    const res = await request(baseURL)
      .get(validRpcNodesApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("data");
  });

  it("should return an error for invalid token", async () => {
    const res = await request(baseURL)
      .get(validRpcNodesApiUrl)
      .set("Authorization", "invalid-api-key");
    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toHaveProperty("message");
  });

  it("should return an error for missing token", async () => {
    const res = await request(baseURL).get(validRpcNodesApiUrl);
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(inValidRpcNodesApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(validRpcNodesApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should create rpc node successfully", async () => {
    const res = await request(baseURL)
      .post(validCreateRpcNodeApiUrl)
      .send({
        address: address,
        url: "https://abc.com",
        type: "generator",
        chainId: "22",
      })
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
    rpcNodeId = res.body.body.rpcNode._id;
  });

  it("should return an error with missing required fields", async () => {
    const res = await request(baseURL)
      .post(validCreateRpcNodeApiUrl)
      .send({
        address: "",
        url: "",
        type: "",
        chainId: "",
      })
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(400);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .post(inValidCreateRpcNodeApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (GET)", async () => {
    const res = await request(baseURL)
      .put(validCreateRpcNodeApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should update rpc node successfully", async () => {
    const res = await request(baseURL)
      .put(`${validUpdateRpcNodeApiUrl}${rpcNodeId}`)
      .send({
        address: address + "x",
        url: "https://abc.com",
        type: "generator",
        chainId: "22",
      })
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it("should return an error with missing required fields", async () => {
    const res = await request(baseURL)
      .put(`${validUpdateRpcNodeApiUrl}${rpcNodeId}`)
      .send({
        address: "",
        url: "",
        type: "",
        chainId: "",
      })
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(400);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .put(`${inValidUpdateRpcNodeApiUrl}${rpcNodeId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (GET)", async () => {
    const res = await request(baseURL)
      .post(`${validUpdateRpcNodeApiUrl}${rpcNodeId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should return a single rpc node data with status 200", async () => {
    const res = await request(baseURL)
      .get(`${validRpcNodeByIdApiUrl}${rpcNodeId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("rpcNode");
  });

  it("should return an error for invalid token", async () => {
    const res = await request(baseURL)
      .get(`${validRpcNodeByIdApiUrl}${rpcNodeId}`)
      .set("Authorization", "invalid-api-key");
    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toHaveProperty("message");
  });

  it("should return an error for missing token", async () => {
    const res = await request(baseURL).get(
      `${validRpcNodeByIdApiUrl}${rpcNodeId}`
    );
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(`${inValidRpcNodeByIdApiUrl}${rpcNodeId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(`${validRpcNodeByIdApiUrl}${rpcNodeId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should delete single rpc node with status 200", async () => {
    const res = await request(baseURL)
      .delete(`${validRpcNodeByIdApiUrl}${rpcNodeId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it("should return an error for invalid token", async () => {
    const res = await request(baseURL)
      .delete(`${validRpcNodeByIdApiUrl}${rpcNodeId}`)
      .set("Authorization", "invalid-api-key");
    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toHaveProperty("message");
  });

  it("should return an error for missing token", async () => {
    const res = await request(baseURL).delete(
      `${validRpcNodeByIdApiUrl}+${rpcNodeId}`
    );
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .delete(`${inValidRpcNodeByIdApiUrl}${rpcNodeId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(`${validRpcNodeByIdApiUrl}${rpcNodeId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});
