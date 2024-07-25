# cabnsHelper.ts

1.  `doValidationForCreateUserCabn(req: any): Promise<any>`

    - Purpose: Validates the necessary fields for creating a user CABN (Currency Address By Network). Throws an error if required fields are missing.
    - Parameters:
      - `req`: The request object containing body data with fields like token contract address, chain ID, currency name, and currency symbol.
    - Throws: Error message if required fields are missing.

2.  `createUserCabn(req: any): Promise<any>`

    - Purpose: Handles the creation of a non-default CABN for a user after ensuring no default CABN exists and the network supports the provided chain ID. It also checks if a CABN already exists and, if not, creates one.
    - Parameters:
      - `req`: The request object containing user and body data necessary for CABN creation.
    - Returns: The newly created or updated CABN document.

3.  `deleteUserIdFromAllCabns(user: any): Promise<any>`

    - Purpose: Deletes a user ID from all non-default CABNs where the user is a creator.
    - Parameters:
      - `user`: User object containing at least the `_id`.
    - Implementation: Fetches all relevant CABNs and removes the user's ID using the helper function `deleteUserIdFromCabn`.

4.  `deleteUserIdFromCabn(user: any, cabnId: string): Promise<any>`

    - Purpose: Removes a user's ID from a specific CABN.
    - Parameters:
      - `user`: User object to remove.
      - `cabnId`: Specific CABN document ID.
    - Implementation: Finds the CABN, updates the `createdByusers` array, and saves the changes.

5.  `checkDefaultCabnAlreadyExist(cabnFilter: any): Promise<any>`

    - Purpose: Checks if a default CABN already exists with the given filter.
    - Parameters:
      - `cabnFilter`: Filter to identify the CABN.
    - Throws: Error if a default CABN exists.

6.  `makeCabnDefault(cabnId: string): Promise<any>`

    - Purpose: Converts a specified CABN to default, removing all creators.
    - Parameters:
      - `cabnId`: ID of the CABN to make default.
    - Returns: The updated CABN document.

Auxiliary functions:

- `removeItemFromList(arr: any, value: any)`: Helper function to remove an item from an array.
- `countCabnByFilter(cabnFilter: any): Promise<any>`: Counts CABNs matching a specific filter.
- `findCabnByFilter(cabnFilter: any): Promise<any>`: Finds a CABN document based on a given filter.
- `getNonDefaultCurrencyInformationObject(body: any)`: Constructs an object with currency information from the request body.
- `addUserIdIntoCabn(cabnFilter: any, req: any): Promise<any>`: Adds a user's ID into a CABN if not already present.

# fiberHelper.ts

### Function: `handleFiberRequest`

Parameters:

- `data`: An `any` type parameter that holds data related to the fiber request. It's expected to contain fields like `responseCode`, `responseMessage`, and details about the withdrawal process.
- `swapTxHash`: A `string` representing the transaction hash of the swap transaction.

Functionality:

1.  Transaction Lookup:

    - The function begins by looking up a `SwapAndWithdrawTransactions` record using the `swapTxHash` provided.
    - Throws an error if no transaction is found, halting further execution.

2.  Transaction Handling Based on Response:

    - If the `responseCode` from the `data` is `200` (successful), it proceeds to update the transaction details:
      - Updates or appends withdrawal transactions based on whether they exist.
      - Updates the destination amount from the `data` if provided.
      - Sets the transaction status to `swapWithdrawCompleted`.
    - If the `responseCode` is not `200`, it sets the transaction status to `swapWithdrawFailed`.

3.  Final Transaction Update:

    - Updates the transaction record with the new status and additional data received (`responseMessage`, `updatedAt`), and logs any errors that occur during the update process.

Error Handling:

- The function includes a try-catch block to handle and log any exceptions that occur during the execution process.

Utility Dependencies:

- Utilizes a utility object `utils` for constants like `swapAndWithdrawTransactionStatuses` which define possible states of the transaction (e.g., completed, failed).

# generatorNodeHelper.ts

1.  **`handleGeneratorRequest`**:

    - **Parameters**:
      - `data` (any): The data received for the generator request.
      - `swapTxHash` (string): The hash of the swap transaction.
    - **Description**:
      - This function handles the generator request by finding the relevant transaction from the database and updating its status based on the data received.
      - It first constructs a filter to find the transaction with the given `swapTxHash` and a pending status.
      - If the transaction is found and the data is valid, it updates the transaction status and details, including handling same-network swaps.
    - **Error Handling**: Logs any errors that occur during the process.

2.  **`getGeneratorSignedData`**:

    - **Parameters**:
      - `transaction` (any): The transaction object to be updated.
      - `signedData` (any): The signed data to be used for updating the transaction.
    - **Description**:
      - Updates the transaction with generator signature data, including salt, address, signatures, token details, and CCTP logs.
    - **Error Handling**: Logs any errors that occur during the process.

3.  **`getTransactionDetail`**:

    - **Parameters**:
      - `transaction` (any): The transaction object to be updated.
      - `signedData` (any): The signed data to be used for updating the transaction.
    - **Description**:
      - Updates the transaction with detailed information such as wallet addresses, amounts, OneInch data, withdrawal data, and more.
    - **Error Handling**: Logs any errors that occur during the process.

4.  **`getAmount`**:

    - **Parameters**:
      - `transaction` (any): The transaction object to be updated.
    - **Description**:
      - Converts the source amount to a human-readable format using `swapUtilsHelper`.
    - **Error Handling**: Logs any errors that occur during the process and handles native tokens separately.

5.  **`getSettledAmount`**:

    - **Parameters**:
      - `transaction` (any): The transaction object to be updated.
      - `settledAmount` (any): The settled amount to be converted.
    - **Description**:
      - Converts the settled amount to a human-readable format using `swapUtilsHelper`.
    - **Error Handling**: Logs any errors that occur during the process and handles native tokens separately.

6.  **`handleSameNetworkSwap`**:

    - **Parameters**:
      - `transaction` (any): The transaction object to be updated.
      - `signedData` (any): The signed data to be used for updating the transaction.
    - **Description**:
      - Handles same-network swaps by updating the transaction status and details.
      - Updates the transaction with relevant information and marks it as a same-network swap.
    - **Error Handling**: Logs any errors that occur during the process.

# masterNodeHelper.ts

### 1\. `handleMasterSignatureCreationRequest`

This function asynchronously handles the creation of a master signature for a swap transaction. It takes two parameters:

- `data`: An object containing any additional data needed for processing the request.
- `swapTxHash`: A string representing the transaction hash of the swap.

Functionality:

- It first defines a filter to locate the relevant transaction in the database using the `swapTxHash` and a specific transaction status.
- If the transaction is found and `data` is provided, it updates the transaction's details with the signed data and changes the transaction status to 'swapCompleted'.
- The transaction is then updated in the database.

Error Handling:

- If an exception occurs, it logs the error.

### 2\. `handleMasterValidationFailureRequest`

This function asynchronously handles cases where master validation fails for a swap transaction. It accepts one parameter:

- `swapTxHash`: A string representing the transaction hash of the swap.

Functionality:

- Similar to the signature creation function, it defines a filter to find the specific transaction.
- If found, it updates the transaction status to 'masterValidationFailed' and updates the time of this change.
- The transaction update is committed to the database.

Error Handling:

- Errors encountered during the process are logged.

### 3\. `getMasterSignedData`

This helper function is used internally to update transaction data with master signed data. It takes two parameters:

- `transaction`: The transaction object to be updated.
- `signedData`: An object containing signed data such as `salt`, `hash`, and `signatures`.

Functionality:

- It updates the transaction's signature details (`withdrawalSig`) with the new signed data and records the update time.
- The modified transaction object is then returned.

Error Handling:

- Catches and logs any exceptions that occur during the data update process.

# swapTransactionHelper.ts

### `validationForDoSwapAndWithdraw(req: any)`

This function validates the necessary parameters for a swap and withdrawal operation. It ensures that all required parameters are present and that the network IDs and CABN IDs (Currency Addresses By Network) are valid MongoDB Object IDs. If any validation fails, it throws an error with a descriptive message.

### `doSwapAndWithdraw(req: any, swapAndWithdrawTransaction: any)`

This asynchronous function handles the process of performing a swap and subsequent withdrawal. It checks if the transaction status is marked as 'swapCompleted', and if so, it triggers the withdrawal process using the `doWithdrawSignedFromFIBER` method from the `withdrawTransactionHelper`.

### `createPendingSwap(req: any)`

This asynchronous function creates a pending swap transaction if none exists for the given `swapTxId`. It performs various database lookups to gather information required for the transaction and creates it if not already present. If the transaction already exists, it simply returns it.

### `toArrayObject(data: any)`

Converts an array of transaction data into objects by applying the `toObject` function to each element.

### `toObject(tx: any)`

Converts a transaction data object into a plain object, stripping out any MongoDB specific fields or unwanted properties like signatures.

### `getFilters(req: any)`

Constructs a filter object based on the request query. It can filter by status, validate node types, and set a specific version for transactions.

### `getDecodedData(logs: any, rpcUrl: string)`

This asynchronous function decodes transaction logs using a specific RPC URL. It attempts to decode the logs and handles cases where the destination network might not be an EVM (Ethereum Virtual Machine) compatible network.

### `hanldeTransactionSuccessForRegenerate(sourceNetwork: any, destinationNetwork: any, decodedDtata: any, swapHash: string)`

Handles successful transactions for the regeneration process. It validates the swap transaction and performs necessary operations if the transaction is deemed valid.

### `hanldeTransactionFailedForRegenerate(receipt: any)`

Handles failed transactions for the regeneration process. It sets appropriate messages and statuses based on the receipt status.

### `doTransactionOperationsForRegenerate(swapHash: string)`

This asynchronous function performs operations on transactions that are pending regeneration. It updates the transaction status based on the time elapsed since the last update and the current status of the transaction.

### `sendSlackNotifcationForRegenerate(swapHash: string, onChainStatus: string, transactionStatusForSupport: string)`

Sends a notification to a configured Slack channel regarding the status of a transaction regeneration. It includes details about the transaction hash, on-chain status, and both previous and current system statuses.

# swapUtilsHelper.ts

1.  amountToHuman(amount: string, decimal: number)

    - Description: Converts a machine-readable amount (like Wei in Ethereum) to a human-readable format (like Ether) by dividing it by 10 raised to the power of the specified decimals.
    - Parameters:
      - `amount`: The amount in machine-readable format as a string.
      - `decimal`: The number of decimal places the token uses.
    - Returns: A string representing the amount in human-readable format.

2.  amountToMachine(network: any, cabn: any, amount: number)

    - Description: Converts a human-readable amount to a machine-readable format (like converting Ether to Wei) by multiplying with 10 raised to the power of the decimals for the specific network and token.
    - Parameters:
      - `network`: An object containing network details including the RPC URL.
      - `cabn`: An object containing token details such as the contract address.
      - `amount`: The amount in human-readable format.
    - Returns: A string representing the amount in machine-readable format.

3.  amountToHuman\_(network: any, cabn: any, amount: number)

    - Description: Similar to `amountToHuman` but accepts network and token details as additional parameters to dynamically fetch the decimal value.
    - Parameters:
      - `network`: An object containing network details.
      - `cabn`: An object containing token details.
      - `amount`: The amount in machine-readable format.
    - Returns: A string representing the amount in human-readable format if successful; otherwise null if decimals cannot be fetched.

4.  decimals(network: any, cabn: any)

    - Description: Fetches the number of decimals used by a token by querying the token contract.
    - Parameters:
      - `network`: An object containing network details including the RPC URL.
      - `cabn`: An object containing token details such as the contract address.
    - Returns: An integer representing the decimal value if the token contract is reachable and supports the decimals method; otherwise null.

# validatorNodeHelper.ts

### 1\. `handleValidatorRequest`

Parameters:

- `data` (any): The data object which potentially includes transaction receipt and signed data relevant to the validator.
- `swapTxHash` (string): The transaction hash of the swap transaction.
- `query` (any): An object which may include address information.

Description: This asynchronous function manages the request from a validator. It first sets up a filter to find a specific transaction using the `swapTxHash` and checks that the transaction does not already have a signature from the validator address provided in the query. If a transaction matches the filter, the function proceeds to verify if the `transactionReceipt` status is true and if `signedData` is present. Depending on these checks, it may update the transaction's status and signatures, marking it as completed or failed based on the criteria provided. The transaction is updated in the database, and any errors are logged to the console.

### 2\. `getValidatorSignedData`

Parameters:

- `transaction` (any): The transaction object to be updated with the validator's signature.
- `signedData` (any): The signed data from the validator which includes the signature, salt, and address.

# withdrawTransactionHelper.ts

### 1\. `doWithdrawSignedFromFIBER(req: any, swapAndWithdrawTransactionObject: any)`

This asynchronous function handles the process of initiating a withdrawal transaction that is signed from FIBER. It takes two parameters:

- `req`: The request object, potentially containing necessary information and parameters.
- `swapAndWithdrawTransactionObject`: An object representing the transaction to be processed.

#### Steps:

- Retrieves and populates the `swapAndWithdrawTransactionObject` from the database using its `_id`. It populates related data from several collections.
- Updates the `updatedAt` and `status` of the transaction object.
- Uses `fiberAxiosHelper.doWithdrawSigned()` to process the withdrawal.
- Returns the updated transaction object.

### 2\. `getTokenQuoteInformationFromFIBER(req: any)`

This asynchronous function fetches token quote information from FIBER. It accepts a single parameter:

- `req`: The request object which may include specific parameters necessary for fetching the quote.

#### Steps:

- Directly returns the result of `fiberAxiosHelper.getTokenQuoteInformation(req)`, which fetches and returns the token quote information.

### 3\. `fiberAuthorizationToken()`

This function generates an authorization token for FIBER interactions, encapsulating time-based validation and encryption.

#### Steps:

- Determines the time window (`startDateTime` and `endDateTime`) around the current time, subtracting and adding a predefined `timelapse` (5 minutes).
- Generates a random key and incorporates an `apiKey` from the global environment settings.
- Creates a token body containing the time window, random key, and API key, then serializes it to JSON.
- Encrypts the serialized token body using AES encryption with a secret from the global environment.
- Prepends 'Bearer ' to the encrypted token and returns it.
