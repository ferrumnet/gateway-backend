# common.ts

1.  `getHashedPassword(password: any): string`

    - Description: Hashes the provided password using SHA256 and returns the hashed password in Base64 encoding.
    - Parameters: `password` (any) - The password to hash.
    - Returns: A string representing the hashed password.

2.  `createToken(object: any, expiresIn: any): string`

    - Description: Creates a JWT (JSON Web Token) for the given object with an optional expiration.
    - Parameters:
      - `object` (any) - The payload to sign.
      - `expiresIn` (any) - Optional duration for which the token is valid.
    - Returns: A JWT as a string.

3.  `decodeAPiToken(token: any): any`

    - Description: Decodes and verifies a given JWT using the application's secret key.
    - Parameters: `token` (any) - The JWT to decode.
    - Returns: The decoded token if valid, otherwise throws an error.

4.  `async validationForUniqueCBN(req: any, res: any): string`

    - Description: Validates that the token contract addresses in the request are unique across the specified networks.
    - Parameters:
      - `req` (any) - The HTTP request object containing `networks`.
      - `res` (any) - The HTTP response object.
    - Returns: An error message if a duplicate is found, otherwise an empty string.

5.  `async validationForSCBN(req: any, res: any, smartContract: any): string`

    - Description: Validates smart contract addresses in the request for uniqueness across specified networks.
    - Parameters:
      - `req` (any) - The HTTP request object.
      - `res` (any) - The HTTP response object.
      - `smartContract` (any) - The smart contract details.
    - Returns: An error message if a validation fails, otherwise an empty string.

6.  `async getValueFromStringsPhrase(queryKey: any): Promise<string>`

    - Description: Fetches a value from a local JSON file based on a query key.
    - Parameters: `queryKey` (any) - The key to query in the JSON file.
    - Returns: A promise that resolves to the value corresponding to the query key or an empty string if not found.

7.  `async triggerAndSetTimeout(id: any): void`

    - Description: Finds a job by ID and sets a competition timeout based on the job's configuration.
    - Parameters: `id` (any) - The ID of the job to fetch and process.
    - Returns: None. This function triggers side effects but does not return a value.

8.  `async isUniqueEmail(email: any): Promise<boolean>`

    - Description: Checks if an email is unique in the database.
    - Parameters: `email` (any) - The email to check.
    - Returns: A promise that resolves to true if the email is unique, false otherwise.

9.  `async fetchTokenHolderBalanceSnapshotAgainstCABNs(model: any): void`

    - Description: Fetches token holder balance snapshots for currency address by network based on a model.
    - Parameters: `model` (any) - The model containing leaderboard details.
    - Returns: None. This function triggers data fetching and processing but does not return a value.

10. `encryptApiKey(data: any): string`

    - Description: Encrypts data using AES with a secret key from the environment configuration.
    - Parameters: `data` (any) - The data to encrypt.
    - Returns: The encrypted data as a string or an empty string if encryption fails.

11. `decryptApiKey(data: any): string`

    - Description: Decrypts AES encrypted data using a secret key from the environment configuration.
    - Parameters: `data` (any) - The data to decrypt.
    - Returns: The decrypted text or an empty string if decryption fails.

12. `getMongoDbUrl(): string`

    - Description: Retrieves the MongoDB connection URL from the environment configuration, decrypting it if necessary.
    - Returns: The MongoDB URL as a string.

13. `getNumberOfAllowedValidators(): Number`

    - Description: Retrieves the number of allowed validators from the environment configuration.
    - Returns: The number of allowed validators as a Number.

# pagination.ts

### Middleware Function

Module: `exports`

Purpose: This middleware function is used to parse and set pagination parameters (limit and offset) in an Express.js request object.

Parameters:

- `req` (any): The HTTP request object from Express.js. This object contains various properties including `query`, which in turn includes pagination parameters.
- `res` (any): The HTTP response object from Express.js. It's not modified or used in this middleware.
- `next` (any): The next middleware function in the Express.js middleware chain.

Functionality:

1.  Limit Parsing and Setting:

    - The function attempts to parse `req.query.limit` into an integer.
    - If `req.query.limit` is not present or cannot be parsed into a valid integer, it defaults to `10`.
    - This parsed or default value is then set back to `req.query.limit`.

2.  Offset Parsing and Setting:

    - Similarly, the function parses `req.query.offset` into an integer.
    - If `req.query.offset` is not present or cannot be parsed, it defaults to `0`.
    - This parsed or default value is then set back to `req.query.offset`.

3.  Proceed to Next Middleware:

    - After setting the pagination parameters, the function calls `next()` to pass control to the next middleware in the stack.

Usage: This middleware can be used in any route where pagination is needed, ensuring that pagination parameters are consistently handled and provided to subsequent middleware or route handlers.

# profileMiddleware.ts

### Function `profileMiddleware`

- Purpose: This middleware function is designed to handle JWT authentication specifically by verifying the profile authorization. It checks if the token provided in the profile-authorization header matches the authorization token, ensuring that the user is authenticated before proceeding to the next middleware.

- Parameters:

  - `req`: The request object from the Express framework. This includes all the client's request information.
  - `res`: The response object from the Express framework. This is used to send back a response to the client.
  - `next`: A callback function that passes control to the next middleware function in the stack.

- Process:

  1.  Header Check: It first checks if both `authorization` and `profile-authorization` headers are present in the request.
  2.  Token Extraction and Verification:
      - The JWT secret is retrieved from a global configuration object.
      - The `profile-authorization` header is decoded using the JWT secret.
      - It then validates if the decoded profile token contains a token that matches the bearer token provided in the `authorization` header.
  3.  Condition Handling:
      - If the tokens match, the function calls `next()` to pass control to the next middleware function.
      - If the tokens do not match or headers are missing, it responds with an HTTP 401 error message indicating that the token is invalid or the authorization header is missing.
  4.  Error Handling: Any errors during the process (e.g., token decoding issues) are logged, and an HTTP 401 response is sent back.

- Responses:

  - `res.http401("Invalid token")`: Sends an HTTP 401 status with "Invalid token" as the response message if the tokens do not match or if an error occurs.
  - `res.http401("Authorization header missing")`: Sends an HTTP 401 status with "Authorization header missing" as the response message if either required header is missing.

This function effectively adds a security layer to ensure that requests to the application's routes are properly authenticated via JWTs, specifically targeting scenarios where a profile token is used alongside a standard authentication token.

# utils.ts

### Function and Variable Descriptions

- increaseTimeOutCount: A commented-out function that potentially was intended to manage and log timeout counts. This function has no active code or return value.

- getCount: Another commented-out function likely designed to return the count of timeouts. Similar to `increaseTimeOutCount`, it contains no active code or return value.

- pick: This function takes an object and an array of keys, returning a new object that includes only the specified keys from the original object. It uses `reduce` to accumulate the result and checks if the original object has the property before adding it to the result object.

### Constants and Object Declarations

- bridgeContractVersions: An object that specifies versions of a bridge contract with properties `V1_0` and `V1_2`.

- expectedSchemaVersionV1_0 and expectedSchemaVersionV1_2: Constants that presumably define schema versions for some data structure or API.

- globalTokenExpiryTime: A string denoting the expiration time for tokens, set to '1800s'.

- swapAndWithdrawTransactionStatuses: An object detailing possible statuses for transactions, including `generatorSignatureCreated`, `validatorSignatureFailed`, and various states of `swap` transactions.

- swapAndWithdrawTransactionJobStatuses: Similar to the above but for job statuses related to transactions, including `pending`, `created`, `failed`, and `completed`.

- nodeTypes: Defines different types of nodes that might be part of the application's infrastructure, such as `generator`, `validator`, `master`, and `fiber`.

### Return Value

- The module exports a `utils` object that carries the properties and functions defined within it. It's also noted to be initialized with `IS_LOCAL_ENV` set to `true`, indicating perhaps this configuration is specific to a local development environment.
