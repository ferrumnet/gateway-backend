# currencies.ts

### 1\. POST `/create`

Creates a new currency entity.

- Parameters: Receives `name`, `symbol`, `networks`, and `organization` in the request body.
- Validation: Checks that all parameters are provided and that `networks` array is not empty.
- Database Operation: Adds the currency to the database using `db.Currencies.create` and associates network addresses using `currencyHelper.createCurrencyAddresses`.
- Response: Returns the created currency object.

### 2\. POST `/update/:id`

Updates an existing currency entity.

- Parameters: Receives `name`, `symbol`, and `organization` in the request body. The currency `id` is specified in the URL.
- Validation: Checks that the required parameters are provided.
- Database Operation: Updates the currency in the database using `db.Currencies.findOneAndUpdate`.
- Response: Returns the updated currency object.

### 3\. GET `/list`

Retrieves a list of all currencies, with optional pagination and search filters.

- Query Parameters: `search`, `isPagination`, `offset`, and `limit`.
- Database Operation: Uses MongoDB's aggregation pipeline to apply filters, pagination, and sorting.
- Response: Returns a list of currencies.

### 4\. GET `/:id`

Retrieves a single currency entity by its `id`.

- Parameters: The currency `id` is specified in the URL.
- Database Operation: Finds the currency using `db.Currencies.findOne` and populates network and decentralized exchange details.
- Response: Returns the currency object.

### 5\. DELETE `/:id`

Deletes a currency entity by its `id`.

- Parameters: The currency `id` is specified in the URL.
- Validation: Checks associations with networks, leaderboards, and token holders before deletion.
- Database Operation: Removes the currency from the database using `db.Currencies.remove`.
- Response: Returns a success message or an error if associations exist.

### 6\. POST `/create/cabn`

Creates a new currency address by network (CABN).

- Parameters: Requires `network` and `currency` in the request body.
- Validation: Checks for unique CABN and non-empty `networks` array.
- Database Operation: Adds a new CABN to an existing currency.
- Response: Returns the updated currency object with new CABN details.

# networks.ts

### `POST /create`

This function creates a new network. It checks for the presence of required fields such as `name`, `ferrumNetworkIdentifier`, `networkShortName`, `chainId`, and `isTestnet`. If `isTestnet` is true, it also requires a `parentId`. It validates the uniqueness of `ferrumNetworkIdentifier` before creating the network in the database. If successful, it returns the created network object.

### `PUT /update/:id`

Updates an existing network specified by `id`. It checks for the same fields as the create function and performs a similar validation process, ensuring the uniqueness of `ferrumNetworkIdentifier` for the update operation. It returns the updated network data.

### `POST /create/multiswap/fiber/information/and/update/network/:id`

Creates a new multiswap fiber information entry and associates it with a specified network by updating the `multiswapNetworkFIBERInformation` field. It uses the given `id` to identify the network and returns the updated network information.

### `PUT /update/multiswap/fiber/information/:id`

Updates fiber information for a given multiswap network. It requires a `fiberRouter` field and updates the corresponding network's `multiSwapFiberRouterSmartContractAddress`. It then updates the fiber information and returns a success message.

### `PUT /active/inactive/:id`

Toggles the active status of a network. It flips the `isActive` flag for the specified network by `id` and returns the updated network data.

### `GET /list`

Lists networks based on query parameters `isNonEVM`, `offset`, and `limit`. It filters networks based on the `isNonEVM` status and paginates the results. The networks are returned with detailed associations populated.

### `GET /:id`

Retrieves detailed information of a single network by `id`. It returns the network with its parent and currency addresses populated, including the decentralized exchanges associated with the network.

### `PUT /allow/on/gateway/:id`

Sets the `isAllowedOnGateway` status for a network by `id`, ensuring the parameters are valid. Returns the updated network or an error if not found.

### `PUT /set/non/evm/:id`

Sets the `isNonEVM` status for a specified network. It checks for a valid network ID and updates the status accordingly, returning the updated network data.

### `PUT /allow/on/multi/swap/:id`

Allows or disallows a network on multi-swap platforms by setting `isAllowedOnMultiSwap`. It performs validation checks and updates the network, returning the updated data.

### `DELETE /:id`

Deletes a network by `id` after ensuring no association with certain dependencies exists. Returns a success response upon successful deletion.

### `PUT /position/for/multi/swap/:id`

Updates the position for a fee token for multi-swap for a specified network. It checks for valid input and updates the `positionForMultiSwap` for the network.

# rpcNodes.ts

### 1\. POST: /create

This endpoint creates a new RPC node. It validates the required fields (`address`, `url`, `type`, `chainId`). If any are missing, it returns a 400 error. If a node with the specified `address`, `url`, and `type` already exists, it prevents duplication and returns an error. Otherwise, it creates the RPC node and returns it in the response.

### 2\. PUT: /update/:id

This endpoint updates an existing RPC node identified by `:id`. It checks for required fields and whether the updated node details already exist in other nodes to avoid duplicates. If validation passes, it updates the node and returns the updated details.

### 3\. GET: /list

This endpoint lists all RPC nodes. It supports pagination through `offset` and `limit` query parameters. It retrieves a list of nodes sorted by creation date in descending order.

### 4\. GET: /:id

Fetches a specific RPC node by its `id`. It returns the details of the node if found.

### 5\. DELETE: /:id

Deletes a specific RPC node by `id`. On successful deletion, it returns a success message.

# users.ts

1.  POST /sign-up

    - Purpose: Registers a new super admin user.
    - Parameters:
      - `firstName`: The first name of the user.
      - `lastName`: The last name of the user.
      - `email`: The user's email address.
      - `password`: The user's password.
    - Validation:
      - Checks if all required fields are provided and if the email has already been registered.
    - Functionality:
      - Converts first and last names to lowercase, hashes the password, and creates the user in the database.
    - Response:
      - Returns a success message with the user's details and an API token if registration is successful. If not, returns an error message.

2.  POST /sign-in

    - Purpose: Authenticates a super admin user and returns an API token.
    - Parameters:
      - `email`: The user's email address.
      - `password`: The user's password.
    - Validation:
      - Ensures both email and password are provided.
    - Functionality:
      - Hashes the provided password, checks the credentials, and if valid, returns the user details and token.
    - Response:
      - Returns a success message with user details and token if authentication is successful; otherwise, returns an error message.

3.  GET /profile/me

    - Purpose: Fetches the profile information of the currently authenticated user.
    - Functionality:
      - Retrieves user details from the database based on the user ID stored in the session.
    - Response:
      - Returns the user's profile details.

4.  PUT /update/active/inactive/:id

    - Purpose: Toggles a user's active status.
    - Parameters:
      - `isActive`: A boolean indicating the new active status.
    - Validation:
      - Checks if the `isActive` parameter is provided.
    - Functionality:
      - Updates the `isActive` status of the user in the database.
    - Response:
      - Returns updated user details or an error if the user is not found.

5.  PUT /update/approval/status/:id

    - Purpose: Updates the approval status of an organization admin by a super admin.
    - Parameters:
      - `approvalStatusAsOrganizationAdminBySuperAdmin`: New approval status (`approved` or `declined`).
    - Validation:
      - Ensures the status is provided.
    - Functionality:
      - Updates the user's approval status in the database and sends a notification email based on the new status.
    - Response:
      - Returns updated user details or an error if the user is not found.

6.  POST /create/application-user

    - Purpose: Registers a new application user.
    - Parameters:
      - `email`, `userName`: User's email and username.
    - Validation:
      - Ensures both email and username are provided and unique.
    - Functionality:
      - Creates a new application user with additional metadata such as API key and authentication status.
    - Response:
      - Returns the new user details or an error if there are validation issues.

7.  GET /profile/:id

    - Purpose: Fetches profile details of a specific user by their ID.
    - Functionality:
      - Retrieves user details based on the provided user ID.
    - Response:
      - Returns the requested user's details or an error if the user is not found.

8.  GET /list

    - Purpose: Lists users based on various filter criteria.
    - Parameters:
      - Various filters such as name, email, role, and authentication statuses.
    - Functionality:
      - Uses MongoDB aggregation to filter, sort, and paginate the list of users based on the provided criteria.
    - Response:
      - Returns a list of users matching the criteria or an error if no users are found.

# versionHistory.ts

#### POST Route ("/")

This route is used to create or retrieve the existing version history based on the request's body.

- Parameters:

  - `req` (any): The request object, expected to contain a body with `walletsVersion`, `networksVersion`, and `cabnsVersion`.
  - `res` (any): The response object used to send data or errors back to the client.

- Functionality:

  - First, it checks if all required fields are present in the body; if not, it returns an HTTP 400 error.
  - It then checks the database for existing version history records using `db.VersionHistory.find()`.
  - If no records exist, it creates a new record with the data provided in the request's body.
  - It returns the first version history record if available; otherwise, it returns the newly created record.

#### PATCH Route ("/")

This route is used to update the latest version history record.

- Parameters:

  - `req` (any): The request object, which should contain an update in the body.
  - `res` (any): The response object for responding to the client.

- Functionality:

  - It retrieves the latest version history record from the database.
  - If a record is found and it has an `_id`, it updates this record with the new data provided in the request's body using `db.VersionHistory.findByIdAndUpdate`.
  - It returns the updated version history record or the previous record if no update was necessary.

# wallets.ts

### Function: Create Wallet

- Endpoint: `POST /create`
- Description: Creates a new wallet entry in the database. It requires the `name` and `logo` of the wallet to be specified in the request body.
- Parameters:
  - `name`: The name of the wallet.
  - `logo`: A URL or a reference to the wallet's logo.
- Response: Returns the created wallet object with a status code of 200 if successful.

### Function: Update Wallet

- Endpoint: `PUT /update/:id`
- Description: Updates an existing wallet. Requires the wallet's ID in the URL and the new `name` and `logo` in the request body.
- Parameters:
  - `id`: Wallet's unique identifier.
  - `name`: New name of the wallet.
  - `logo`: New logo of the wallet.
- Response: Returns the updated wallet object.

### Function: Set Non-EVM Wallet

- Endpoint: `PUT /set/non/evm/:id`
- Description: Designates a wallet as non-EVM (Ethereum Virtual Machine) compatible.
- Parameters:
  - `id`: Wallet's unique identifier.
  - `isNonEVM`: Boolean flag to set the wallet as non-EVM.
- Response: Returns the updated wallet object with a new non-EVM status.

### Function: List Wallets

- Endpoint: `GET /list`
- Description: Retrieves a list of all wallets, supports pagination through query parameters.
- Query Parameters:
  - `offset`: Pagination offset.
  - `limit`: Number of wallets to return per page.
- Response: Returns a list of wallets.

### Function: Get Wallet by ID

- Endpoint: `GET /:id`
- Description: Retrieves a wallet by its unique identifier.
- Parameters:
  - `id`: Wallet's unique identifier.
- Response: Returns the wallet object.

### Function: Delete Wallet

- Endpoint: `DELETE /:id`
- Description: Deletes a wallet by its ID.
- Parameters:
  - `id`: Wallet's unique identifier.
- Response: Returns a success message upon successful deletion.

### Function: Create Wallet by Network

- Endpoint: `POST /wbn/create`
- Description: Creates a new wallet association with a network.
- Parameters:
  - `wallet`: Wallet's unique identifier.
  - `network`: Network's unique identifier.
- Response: Returns the created WalletByNetwork object.

### Function: List Wallets by Network

- Endpoint: `GET /wbn/list`
- Description: Lists wallets by network, with support for filtering based on network and wallet IDs.
- Query Parameters:
  - `network`: Network's unique identifier.
  - `wallet`: Wallet's unique identifier.
- Response: Returns a list of WalletByNetwork objects.

### Function: Get Wallet by Network

- Endpoint: `GET /wbn/:id`
- Description: Retrieves a specific WalletByNetwork entry by its ID.
- Parameters:
  - `id`: WalletByNetwork's unique identifier.
- Response: Returns the WalletByNetwork object.

### Function: Delete Wallet by Network

- Endpoint: `DELETE /wbn/:id`
- Description: Deletes a WalletByNetwork entry by its ID.
- Parameters:
  - `id`: WalletByNetwork's unique identifier.
- Response: Returns a success message upon successful deletion.

# referralFeeManagement.ts

##### 1\. `POST /create`

- **Description**: This route is used to create a new referral fee management entry.
- **Method**: `POST`
- **Endpoint**: `/create`

###### Request Validation

- **Validation**:
  - Checks if `tier`, `fee`, `discount`, and `feeType` are provided in the request body.
  - Ensures `fee` and `discount` are not negative values.
- **Error Response**: Returns a 400 status with an error message if validation fails.

###### Creating Referral Fee Management

- **Database Operation**: Uses `db.ReferralFeeManagement.create` to create a new entry with the provided request body data.
- **Success Response**: Returns a 200 status with the created `referralFeeManagement` object.

##### 2\. `PUT /update/:id`

- **Description**: This route updates an existing referral fee management entry.
- **Method**: `PUT`
- **Endpoint**: `/update/:id`

###### Request Validation

- **Validation**:
  - Checks if `id` is provided in the URL parameters.
  - Ensures `tier`, `fee`, `discount`, and `feeType` are provided in the request body.
  - Ensures `fee` and `discount` are not negative values.
- **Error Response**: Returns a 400 status with an error message if validation fails.

###### Updating Referral Fee Management

- **Database Operation**: Uses `db.ReferralFeeManagement.findOneAndUpdate` to update the entry identified by `id` with the provided request body data.
  - Converts `id` to a MongoDB ObjectId.
  - Returns the updated document with `{ new: true }` option.
- **Success Response**: Returns a 200 status with the updated `referralFeeManagement` object.
