# nodeInfraAuthHelper.ts

### 1\. `getKey(url: string, nodeType: string, address: string): string`

This function determines and retrieves the appropriate API key based on the type of node and the URL provided. It checks the node type against pre-defined types such as generator, validator, and master. Depending on the node type and URL pattern, it retrieves the corresponding key from the global environment settings.

- Parameters:

  - `url`: The URL associated with the node request.
  - `nodeType`: A string representing the type of the node (e.g., generator, validator).
  - `address`: The address associated with the node.

- Returns: The API key as a string. Returns an empty string if no appropriate key is found.

### 2\. `isTokenValid(token: any, key: string): boolean`

This function validates a given token by decrypting it using a specified key and checking if the dates within the decrypted token are valid.

- Parameters:

  - `token`: The token to be validated.
  - `key`: The encryption key used for decrypting the token.

- Returns: A boolean value indicating whether the token is valid.

### 3\. `validateDates(data: any): boolean`

Validates the start and end dates within a data object to ensure they encompass the current date and time.

- Parameters:

  - `data`: An object containing `startDateTime` and `endDateTime` properties.

- Returns: A boolean indicating whether the current date and time fall between the start and end dates.

### 4\. `createAuthToken(key: string)`

Generates an authentication token based on the provided key. It creates a token with start and end dates set around the current time (1 minute before and after), includes a randomly generated key, encrypts this information, and returns the encrypted token.

- Parameters:

  - `key`: The encryption key used to encrypt the token details.

- Returns: An encrypted string representing the authentication token.

# rootAuthHelper.ts

### 1\. `decodeToken(req: any): Response`

This function takes an HTTP request object as its parameter. It extracts the JWT token from the `Authorization` header and attempts to verify and decode it based on the route being accessed and additional query parameters. The function utilizes `filterRoutesAndVerify` to either validate the token against a node infrastructure or verify it directly using a JWT secret if the route does not match specific patterns.

### 2\. `filterRoutesAndVerify(token: string, url: string, nodeType: string, address: string): Response`

A helper function used by `decodeToken` to determine the correct verification strategy based on the URL accessed. It supports two main types of routes: `/v1/transactions/` and `/v1/rpcNodes/`. For these routes, it checks the validity of the token with a dynamically determined key. For other routes, it directly verifies the token against the global JWT secret. The result is a response object indicating whether the request originates from a node infrastructure, whether the token is valid, and an identifier if available.

### 3\. `getUser(id: string): Promise<any>`

Asynchronously retrieves a user object from the database based on the provided user ID. It queries the `Users` collection in the database for an object matching the given `_id`.

### 4\. `invalidRequest(res: any): Promise<any>`

A utility function that sends a 401 Unauthorized HTTP response with a message indicating that the token is invalid. It is typically used in conjunction with token verification processes to handle cases where token validation fails.

### 5\. `getUserForPublicApis(req: any): Promise<any>`

This function is designed for public API endpoints. It extracts and verifies the JWT token from the `Authorization` header. If the token is valid, it retrieves the user associated with the token's `_id`. The function is designed to return either a user object or `null` if the token is invalid or no user is found.
