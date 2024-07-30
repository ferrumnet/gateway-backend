var request = require("supertest");
import {
  baseURL,
  createAuthTokenForNodeInfra,
  generatorNodeApiKey,
  validatorNodeApiKey,
  masterNodeApiKey,
  generatorNodePublicKey,
  validatorNodePublicKey,
  masterNodePublicKey,
} from "../constants/constants";
const validNetworkListApiUrl = "/api/v1/networks/list";
const inValidNetworkListApiUrl = "/api/v1/network/list";
const validTransactionListApiUrl = "/api/v1/transactions/list";
const inValidTransactionListApiUrl =
  "/api/v1/transactions/update/from/generator";
const validUpdateGeneratorApiUrl = "/api/v1/transactions/update/from/generator";
const inValidUpdateGeneratorApiUrl =
  "/api/v1/transactions/update/from/generators";
const validUpdateValidatorApiUrl = "/api/v1/transactions/update/from/validator";
const inValidUpdateValidatorApiUrl =
  "/api/v1/transactions/update/from/validators";
const validUpdateMasterApiUrl = "/api/v1/transactions/update/from/master";
const inValidUpdateMasterApiUrl = "/api/v1/transactions/update/from/masters";
const transactionTxId =
  "0x9401a086c1eb1bc104a95ee0ff980a456033bac10f2d7cbc5139a33dd0636190";

describe("API Endpoint Testing", () => {
  it("should return a list of networks with status 200", async () => {
    const res = await request(baseURL).get(validNetworkListApiUrl);
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("networks");
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL).get(inValidNetworkListApiUrl);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL).post(validNetworkListApiUrl);
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should return a list of swapPending transactions with status 200", async () => {
    const res = await request(baseURL)
      .get(
        `${validTransactionListApiUrl}?status=swapPending&limit=20&nodeType=generator&address=${generatorNodePublicKey}`
      )
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(generatorNodeApiKey)}`
      );
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("transactions");
  });

  it("should return an error with invalid token", async () => {
    const res = await request(baseURL)
      .get(
        `${validTransactionListApiUrl}?status=swapPending&limit=20&nodeType=generator&address=${generatorNodePublicKey}`
      )
      .set("Authorization", "Bearer invalid_token");
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(
        `${inValidTransactionListApiUrl}?status=swapPending&limit=20&nodeType=generator&address=${generatorNodePublicKey}`
      )
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(generatorNodeApiKey)}`
      );
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(
        `${validTransactionListApiUrl}?status=swapPending&limit=20&nodeType=generator&address=${generatorNodePublicKey}`
      )
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(generatorNodeApiKey)}`
      );
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should return a list of generatorSignatureCreated transactions with status 200", async () => {
    const res = await request(baseURL)
      .get(
        `${validTransactionListApiUrl}?status=generatorSignatureCreated&limit=20&nodeType=validator&address=${validatorNodePublicKey}`
      )
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(validatorNodeApiKey)}`
      );
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("transactions");
  });

  it("should return an error with invalid token", async () => {
    const res = await request(baseURL)
      .get(
        `${validTransactionListApiUrl}?status=generatorSignatureCreated&limit=20&nodeType=validator&address=${validatorNodePublicKey}`
      )
      .set("Authorization", "Bearer invalid_token");
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(
        `${inValidTransactionListApiUrl}?status=generatorSignatureCreated&limit=20&nodeType=validator&address=${validatorNodePublicKey}`
      )
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(validatorNodeApiKey)}`
      );
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(
        `${validTransactionListApiUrl}?status=generatorSignatureCreated&limit=20&nodeType=validator&address=${validatorNodePublicKey}`
      )
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(validatorNodeApiKey)}`
      );
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should return a list of validatorSignatureCreated transactions with status 200", async () => {
    const res = await request(baseURL)
      .get(
        `${validTransactionListApiUrl}?status=validatorSignatureCreated&limit=20&nodeType=master&address=${masterNodePublicKey}`
      )
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(masterNodeApiKey)}`
      );
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("transactions");
  });

  it("should return an error with invalid token", async () => {
    const res = await request(baseURL)
      .get(
        `${validTransactionListApiUrl}?status=validatorSignatureCreated&limit=20&nodeType=master&address=${masterNodePublicKey}`
      )
      .set("Authorization", "Bearer invalid_token");
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(
        `${inValidTransactionListApiUrl}?status=validatorSignatureCreated&limit=20&nodeType=master&address=${masterNodePublicKey}`
      )
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(masterNodeApiKey)}`
      );
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(
        `${validTransactionListApiUrl}?status=validatorSignatureCreated&limit=20&nodeType=master&address=${masterNodePublicKey}`
      )
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(masterNodeApiKey)}`
      );
    expect(res.statusCode).toEqual(404);
  });
});

// This api will not do any updation. Becuase of empty body. Due to security reason we haven't impelemented body validations
describe("API Endpoint Testing", () => {
  it("should return with status 200", async () => {
    const res = await request(baseURL)
      .put(
        `${validUpdateGeneratorApiUrl}/${transactionTxId}?address=${generatorNodePublicKey}`
      )
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(generatorNodeApiKey)}`
      )
      .send({}); // sent empty body. Reason is already given above
    expect(res.statusCode).toEqual(200);
  });

  it("should return an error for invalid token", async () => {
    const res = await request(baseURL)
      .put(
        `${validUpdateGeneratorApiUrl}/${transactionTxId}?address=${generatorNodePublicKey}`
      )
      .set("Authorization", `Bearer invalid-token`)
      .send({});
    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toHaveProperty("message");
  });

  it("should return an error for missing token", async () => {
    const res = await request(baseURL)
      .put(
        `${validUpdateGeneratorApiUrl}/${transactionTxId}?address=${generatorNodePublicKey}`
      )
      .send({});
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .put(
        `${inValidUpdateGeneratorApiUrl}/${transactionTxId}?address=${generatorNodePublicKey}`
      )
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(generatorNodeApiKey)}`
      )
      .send({});
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(
        `${validUpdateGeneratorApiUrl}/${transactionTxId}?address=${generatorNodePublicKey}`
      )
      .set(
        "Authorization",
        `Bearer ${await createAuthTokenForNodeInfra(generatorNodeApiKey)}`
      )
      .send({});
    expect(res.statusCode).toEqual(404);
  });
});
