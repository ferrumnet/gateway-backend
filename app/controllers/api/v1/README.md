# currencies.ts

### 1\. Get Specific Currency

- Endpoint: `GET /:name`
- Description: Fetches a specific currency by its name. The currency name is case-insensitively matched and the details are populated with addresses by network and decentralized exchange information.
- Parameters:
  - `name`: Path parameter to specify the currency name.
- Response: Returns the currency details including associated network and decentralized exchanges.

### 2\. List Currency Addresses by Network (Deprecated)

- Endpoint: `GET /cabn/list`
- Description: Lists currency addresses by network based on various filters like search terms, default status, contract address, and network specifics. Supports pagination.
- Query Parameters:
  - `search`: Search term for matching currency name or symbol.
  - `isDefault`, `tokenContractAddress`, `isAllowedOnMultiSwap`, `network`, `chainId`: Filters for the query.
  - `isPagination`, `offset`, `limit`: Pagination controls.
- Response: Returns a list of currency addresses by network as per the specified filters.

### 3\. List Fee Token Data

- Endpoint: `GET /cabn/for/fee/token/list`
- Description: Retrieves a list of currency addresses filtered by whether they are default fee tokens, along with sort and pagination options.
- Query Parameters:
  - `isDefault`, `isFeeToken`, `isBaseFeeToken`, `networkId`, `sortKey`, `sortOrder`: Filters for sorting and specifying the fee token type.
  - `isPagination`, `offset`, `limit`: Pagination controls.
- Response: Returns a list of fee-related currency addresses.

### 4\. Get Token Data

- Endpoint: `GET /token/data`
- Description: Fetches token data based on the contract address and chain ID, ensuring that the token is marked as default.
- Query Parameters:
  - `tokenContractAddress`, `chainId`: Required parameters to specify the token.
- Response: Returns detailed information about the token if found, otherwise returns an error message.

### 5\. Bulk List of Currency Addresses by Network

- Endpoint: `GET /cabn/bulk/list`
- Description: Provides a bulk listing of currency addresses by network, allowing for complex queries including sorting by priority and filtering by user-specific criteria.
- Query Parameters:
  - `network`, `tokenContractAddress`, `isAllowedOnMultiSwap`, `priority`, `chainId`, `search`: Parameters for complex filtering.
  - `isPagination`, `offset`, `limit`: Pagination controls.
- Response: Returns a comprehensive list of currency addresses based on the query parameters.

# gasFees.ts

### GET `/:chainId`

This route handler responds to GET requests targeting the `/:chainId` path. It's used to fetch gas fee information for a specific blockchain identified by `chainId`.

Parameters:

- `router`: The router object used for setting up API routes.
- `req (Request)`: The HTTP request object.
- `res (Response)`: The HTTP response object.

URL Path Variables:

- `chainId`: The blockchain identifier used to specify which blockchain's gas fees to retrieve.

Query Parameters:

- `type`: Optional. Specifies the type of gas fees data to fetch (e.g., "general").

Functionality:

1.  Initializes a `filter` object with a default type of "general".
2.  If `chainId` is specified in the URL path parameters, it adds this to the `filter`.
3.  If `type` is specified in the query parameters, it overrides the default type in the `filter`.
4.  Performs a database lookup using `db.GasFees.findOne(filter)` to fetch the relevant gas fees data.
5.  Returns the fetched data wrapped in a `http200` response with the gas fees included in the response body.

# networks.ts

1.  GET '/' Route

    - Purpose: Retrieves a specific network based on the `ferrumNetworkIdentifier` query parameter.
    - Logic:
      - Constructs a filter using `ferrumNetworkIdentifier`.
      - Finds the network in the database using the constructed filter.
      - Populates related data about currency and decentralized exchanges linked to the network.
      - Sends a 200 response with the network data if found, otherwise sends a 400 error.
    - API Response:
      - 200: Success, returns network data.
      - 400: Failure, network not found.

2.  GET '/list' Route

    - Purpose: Retrieves a list of networks based on various filtering and sorting criteria provided via query parameters.
    - Logic:
      - Constructs a filter based on parameters like `isAllowedOnMultiSwap`, `isAllowedOnGateway`, `isActive`, `isNonEVM`.
      - Handles sorting and pagination based on `sortKey`, `sortOrder`, `offset`, and `limit`.
      - Queries the database using the constructed filter and sends the results.
    - API Response:
      - 200: Success, returns a list of networks.

3.  GET '/:id' Route

    - Purpose: Retrieves a specific network based on its identifier provided in the URL path.
    - Logic:
      - Constructs a filter using the `id` provided in the route parameter, potentially matching it against `ferrumNetworkIdentifier`, `chainId`, or database `_id`.
      - If a network isn't found initially, attempts a secondary lookup by the network identifier.
      - Sends a 200 response with the network data if found, otherwise sends a 400 error.
    - API Response:
      - 200: Success, returns network data.
      - 400: Failure, network not found.

4.  getNetworkByNetworkId Function

    - Purpose: Helper function to retrieve a network by its `_id`.
    - Parameters: `network` (any) - partial network data, `req` (any) - the request object.
    - Returns: The network if found, logs an error if an exception occurs.
    - Logic:
      - Tries to find a network by `_id`, populates related data, and returns it.
      - Catches and logs any exceptions that occur during the operation.

# rpcNodes.ts

##### Route: `GET /list`

This route handler function is designed to fetch and return a list of RPC nodes based on optional query parameters. The function is asynchronous, indicating it involves operations that complete over time, like database queries.

###### Parameters:

- `req`: Request object containing information about the HTTP request that triggered this route handler.
- `res`: Response object used to send back the desired HTTP response.

###### Functionality:

1.  Initialize Filter: Initializes an empty filter object. This filter will be used to query the database based on conditions derived from the request's query parameters.

2.  Query Conditions:

    - If `address` is provided in the query string, the filter is updated to include this address, converted to lowercase.
    - If `type` is provided, it is also added to the filter.

3.  Data Fetching: Depending on the presence and value of `isPagination` in the query:

    - Without Pagination: Directly fetches all entries matching the filter from the `RpcNodes` database collection, sorted by their creation date in descending order.
    - With Pagination: Fetches a subset of entries according to pagination options provided (`offset` and `limit`). Entries are sorted by creation date in descending order.

4.  Response: Sends a successful HTTP response (200 status code) with the fetched data encapsulated within a `data` object.

###### Example Usage:

A client might make a GET request to `/api/v1/rpcNodes/list?address=someAddress&type=someType&isPagination=false` to fetch all nodes of a specific type and address without pagination.

# swapTransactions.ts

### 1\. `POST /:id`

Description: This endpoint handles the retrieval of transaction details based on a transaction ID specified as a URL parameter. Parameters:

- `id` (URL parameter): The ID of the transaction to retrieve.
- `network` (in the body): The ID of the network from which to retrieve the transaction.

Functionality:

- First, the function finds the network document in the database using the provided network ID.
- Then, it uses the `web3Helper.getTransaction` function to fetch the transaction details from the specified network.
- The transaction details are returned as a response with HTTP status 200.

### 2\. `POST /get/fees`

Description: This endpoint calculates the transaction fees for a given network, based on the current conditions fetched through the Web3 interface. Parameters:

- `network` (in the body): The ID of the network for which to calculate the fees.

Functionality:

- Retrieves the network details from the database using the network ID.
- Uses the `web3Helper.getFeesUsingWeb3` function to calculate the fees for transactions on the provided network.
- Returns the calculated fees as a response with HTTP status 200.

### 3\. `GET /transactions/list`

Description: This endpoint provides a paginated and filtered list of swap and withdrawal transactions. Query Parameters:

- `search`: A search string to filter transactions based on various fields like transaction ID, wallet addresses, etc.
- `limit`: Maximum number of transactions to return per page (default is 10).
- `offset`: Number of transactions to skip (for pagination).

Functionality:

- Constructs a MongoDB query filter based on the provided search parameter. This filter applies a regex search across multiple fields such as `receiveTransactionId`, `withdrawTransactions.transactionId`, `sourceWalletAddress`, and `destinationWalletAddress`.
- Retrieves a list of transactions that match the filter criteria, limited and paginated based on the provided `limit` and `offset` parameters.
- Additionally, sorts the results by creation date in descending order.
- Excludes certain fields from the result set for performance optimization.
- Populates related fields such as `sourceNetwork`, `destinationNetwork`, and associated currencies for both source and destination.
- Returns the transactions and total count of matching documents as a response with HTTP status 200.

# transactions.ts

#### `GET /list`

- Purpose: Fetches a list of transactions.
- Implementation:
  - Retrieves filter criteria from the request.
  - Depending on the query parameter `isPagination`, it fetches all transactions if `isPagination` is `false` or paginated results otherwise.
  - Populates related data from `destinationNetwork` and `sourceNetwork`, as well as `sourceCabn` and `destinationCabn`.
  - Transactions are sorted by creation date in descending order.

#### `PUT /update/from/fiber/:swapTxHash`

- Purpose: Updates a transaction based on data from the Fiber node.
- Implementation:
  - Calls `handleFiberRequest` passing the request body and swap transaction hash.
  - Sends a success message response.

#### `PUT /update/from/generator/:swapTxHash`

- Purpose: Updates a transaction based on data from the Generator node.
- Implementation:
  - Calls `handleGeneratorRequest` with the request body and swap transaction hash.
  - Sends a success message response.

#### `PUT /update/from/validator/:swapTxHash`

- Purpose: Updates a transaction based on data from the Validator node.
- Implementation:
  - Calls `handleValidatorRequest` with the request body, swap transaction hash, and additional query parameters.
  - Sends a success message response.

#### `PUT /update/from/master/:swapTxHash`

- Purpose: Handles Master node request which can either update a transaction or handle validation failure.
- Implementation:
  - Depending on the `isValidationFailed` query parameter, either:
    - Calls `handleMasterValidationFailureRequest` if validation failed.
    - Calls `handleMasterSignatureCreationRequest` to update the transaction otherwise.
  - Sends a success message response.

# users.ts

### `router.post('/forgot-password', async (req, res))`

This route handler manages the forgot password functionality. It checks for required fields (`email`, `url`, and `role`). If the required data is missing, it returns a 400 status with an error message. If the user is found, it generates a temporary token, updates the user with a `forgotPasswordAuthenticationToken`, composes an email link, and sends an email with a reset link.

### `router.post('/forgot-password/authenticate/link', async (req, res))`

This function handles the link authentication for password reset. It checks for the presence of a token, decodes it, and validates the user with the provided token. If the token is invalid or expired, it returns an error. If the user is validated, it updates the user's `forgotPasswordAuthenticationToken` and returns a success response with a new API token.

### `router.put('/reset-password', async (req, res))`

Handles password resetting. It requires a `newPassword` and checks the user's current session. If valid, it hashes the new password, updates the user record, and returns a success response including the user's details and a new API token.

### `router.post('/re-send/email/otp', async (req, res))`

This endpoint handles resending an OTP for email verification. It checks if the `email` is provided, generates a new OTP, updates the user record, and sends an OTP email. It returns a success or error message based on whether the user was found and updated.

### `router.post('/authenticate/email/otp', async (req, res))`

This route manages the OTP authentication for email verification. It requires an `email` and `OTP`, validates them against the stored values, checks the OTP expiry, and, if valid, updates the user's email verification status to authenticated and returns a success response.

# versionHistory.ts

`module.exports = function (router: any) {

/\*\*

\* GET route handler for retrieving the most recent version history entry.

\* It queries the database for version history records and returns the latest one.

\* If there are no records available, it returns an empty object.

\*

\* @param {any} router - The router object used to define route handlers.

\*/

router.get("/", async (req: any, res: any) => {

// Fetching all version history records from the database

let versionHistory = await db.VersionHistory.find();

// Responds with HTTP 200 status and the most recent version history.

// If no records are found, it returns an empty object.

return res.http200({

versionHistory: versionHistory.length > 0 ? versionHistory[0] : {},

});

});

};`

This code snippet exports a function that takes a `router` parameter and defines a GET route at the root (`"/"`) path. This route handler is an asynchronous function that queries the database for version history entries using `db.VersionHistory.find()`. If there are records found, it returns the most recent one; otherwise, it returns an empty object. The result is sent back to the client with a 200 HTTP status code through `res.http200()`.

# wallets.ts

### Route Handler: `router.get('/wbn/list', async (req, res) => {...})`

- Route Path: `/wbn/list`
- HTTP Method: GET
- Asynchronous: Yes, uses async/await for handling asynchronous operations.
- Purpose: Fetches a list of wallet by network (wbn) based on specified query parameters and returns them in a structured response.
- Query Parameters:
  - `networkId`: Filters the wallets by the provided network ID.
  - `isNonEVM`: Filters wallets based on whether they are non-EVM (Ethereum Virtual Machine) compatible.
  - `sortKey` & `sortOrder`: Specifies the sorting parameter and order for the results.
  - `isPagination`, `offset`, `limit`: Controls pagination; `offset` and `limit` determine the page size and offset.

Internal Logic:

1.  Filter Construction:

    - Uses the provided query parameters to construct MongoDB aggregation filters.
    - Handles both inclusive (`$and`) and exclusive (`$or`) conditions based on the provided parameters.

2.  Aggregation Pipeline:

    - Constructs an aggregation pipeline with `$lookup` for joining related collections (`networks` and `wallets`).
    - Uses `$unwind` to deconstruct array fields from the joined collections.
    - Depending on the `networkId` presence, adjusts the pipeline stages for optimal querying.
    - Handles sorting and pagination based on user input.

3.  Database Query:

    - Executes the constructed MongoDB aggregation pipeline using the `aggregate` method on the `WalletByNetwork` collection.
    - Returns the results in the HTTP response with a `200 OK` status.

Response Structure:

- Returns a JSON object with a key `walletByNetworks` containing an array of the filtered and sorted wallet records.

# referrals.ts

#### Endpoint: `/fee-distribution`

**Method**: GET

**Description**: This endpoint retrieves the fee distribution details for a user based on their wallet address and, optionally, a referral code. It performs various database operations to fetch the necessary information about the user's referral status and the associated fee management details.

**Detailed Explanation**:

1.  **Fetch Address**:

    - The function starts by querying the `Addresses` collection to find a document matching the `walletAddress` provided in the query parameters. It ensures the address is in lowercase and populates the `user` field.

2.  **Determine Referral**:

    - If the address's associated user has a referral, it fetches the referral details from the `Referrals` collection.
    - If the user does not have a referral but a referral code is provided in the query parameters, it searches for the referral by the code and updates the user's referral field if found.

3.  **No Referral Case**:

    - If no referral is found, the function responds with an undefined fee distribution.

4.  **Fetch Fee Management**:

    - The function attempts to find the user's address in the `ReferralFeeManagement` collection to fetch the fee and discount details.
    - If not found, it defaults to the general tier fee management.

5.  **Response**:

    - Finally, it responds with the fee distribution details, including the recipient's address, the fee, and the discount.
