var request = require("supertest");
import { baseURL } from "../constants/constants";
// super admin apis end points
const validSignInApiUrl = "/api/v1/super-admin/users/sign-in";
const inValidSignInpiUrl = "/api/v1/super-admin/users/sign-inn";
const validMyProfileApiUrl = "/api/v1/super-admin/users/profile/me";
const inValidMyProfileApiUrl = "/api/v1/super-admin/users/profile//me";
const validProfileApiUrl = "/api/v1/super-admin/users/profile";
const inValidProfileApiUrl = "/api/v1/super-admin/users/profiles";
const validUserListApiUrl = "/api/v1/super-admin/users/list";
const inValidUserListApiUrl = "/api/v1/super-admin/users/lists";

export let userProfileId = "6204f7be81113b1c740e5432";
export let superAdminSessionToken = "";

describe("POST API Endpoint Testing", () => {
  it("should sign in successfully", async () => {
    const res = await request(baseURL).post(validSignInApiUrl).send({
      email: "", // please create super admin directly into database and use that email here
      password: "", // please create super admin directly into database and use that password here
    });
    expect(res.statusCode).toEqual(200);
    superAdminSessionToken = res?.body?.body?.token;
  });

  it("should return an error with invalid credentials", async () => {
    const res = await request(baseURL).post(validSignInApiUrl).send({
      email: "temp@gmail.com",
      password: "invalid123",
    });
    expect(res.statusCode).toEqual(401);
  });

  it("should return an error with missing required fields", async () => {
    const res = await request(baseURL).post(validSignInApiUrl).send({
      password: "invalid123",
    });
    expect(res.statusCode).toEqual(400);
  });

  it("should return an error with missing required fields", async () => {
    const res = await request(baseURL).post(validSignInApiUrl).send({
      email: "temp@gmail.com",
    });
    expect(res.statusCode).toEqual(400);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL).post(inValidSignInpiUrl);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (GET)", async () => {
    const res = await request(baseURL).get(validSignInApiUrl);
    expect(res.statusCode).toEqual(404);
  });
});

describe("GET API Endpoint Testing", () => {
  it("should get valid data", async () => {
    const res = await request(baseURL)
      .get(validMyProfileApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it("should return an error with invalid token", async () => {
    const res = await request(baseURL)
      .get(validMyProfileApiUrl)
      .set("Authorization", "Bearer invalid_token");
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(inValidMyProfileApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(validMyProfileApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("GET API Endpoint Testing", () => {
  it("should get valid data", async () => {
    const res = await request(baseURL)
      .get(`${validProfileApiUrl}/${userProfileId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it("should return an error with invalid token", async () => {
    const res = await request(baseURL)
      .get(`${validProfileApiUrl}/${userProfileId}`)
      .set("Authorization", "Bearer invalid_token");
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(`${inValidProfileApiUrl}/${userProfileId}`)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(validMyProfileApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("API Endpoint Testing", () => {
  it("should return a list of users with status 200", async () => {
    const res = await request(baseURL)
      .get(validUserListApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.body).toHaveProperty("users");
  });

  it("should return an error for invalid token", async () => {
    const res = await request(baseURL)
      .get(validUserListApiUrl)
      .set("Authorization", "invalid-api-key");
    expect(res.statusCode).toEqual(401);
    expect(res.body.status).toHaveProperty("message");
  });

  it("should return an error for missing token", async () => {
    const res = await request(baseURL).get(validUserListApiUrl);
    expect(res.statusCode).toEqual(401);
  });

  it("should handle non-existent endpoint with status 404", async () => {
    const res = await request(baseURL)
      .get(inValidUserListApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 for invalid method (POST)", async () => {
    const res = await request(baseURL)
      .post(validUserListApiUrl)
      .set("Authorization", `Bearer ${superAdminSessionToken}`);
    expect(res.statusCode).toEqual(404);
  });
});
