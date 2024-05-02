# auth.ts

### Function: Middleware for Authentication

Location: `auth.ts`

Purpose: This middleware function is used to authenticate requests based on the `Authorization` header. It performs several checks and operations to ensure that the request is valid and authorized.

Parameters:

- `req`: The request object from the client. It is expected to have a header `authorization` which contains the authentication token.
- `res`: The response object to the client. This can be used to send responses back to the client.
- `next`: A callback function that passes control to the next middleware function in the stack.

Process:

1.  Check Authorization Header:

    - The function first checks if the `Authorization` header is present in the request. If it is missing, the function responds with a 401 status code and a message indicating that the authorization header is missing.

2.  Token Decoding and Validation:

    - If the authorization header is present, the token is decoded using the `decodeToken` function imported from `authHelpers/rootAuthHelper`.
    - It then checks if the decoded token is valid (`response.isValid`). If not, it calls `invalidRequest` to send an appropriate response.
    - It further checks if the token is from Node infrastructure (`response.isFromNodeInfra`). If not, it proceeds to fetch the user details.

3.  User Validation:

    - If the token is not from Node infrastructure, it fetches the user associated with the ID in the decoded token using `getUser`.
    - If no user is found, it sends an invalid request response.

4.  Setting User and Proceeding:

    - If a user is found, the user information is attached to the request object (`req.user = user`), and the middleware passes control to the next middleware in the stack by calling `next()`.

Error Handling:

- Any errors during the execution of the middleware (like issues in token decoding or user fetching) are caught in a try-catch block. The caught errors are logged, and an invalid request response is sent back.

Imports:

- The middleware uses several helpers from `authHelpers/rootAuthHelper`, including `decodeToken`, `getUser`, and `invalidRequest` for various authentication tasks.

# logger.ts

### Content of `app/lib/logger.ts`:

typescript

Copy code

`var bunyan = require('bunyan');
module.exports = bunyan.createLogger({"name": "Leaderboard backend", "level": 10});`

### Detailed Explanation:

- Importing Bunyan: The code begins by importing the Bunyan library using `require`. Bunyan is a simple and fast JSON logging library for Node.js services.

  typescript

  Copy code

  `var bunyan = require('bunyan');`

- Creating and Exporting Logger: The logger is created with specific configurations using `bunyan.createLogger` and then exported. The configuration object passed to `createLogger` includes:

  - `name`: A string representing the name of the logger. Here, it is set to `"Leaderboard backend"`, which could be the name of the project or the component for which the logger is configured.
  - `level`: An integer representing the log level. The value `10` corresponds to the 'TRACE' level in Bunyan, which is the most detailed level of logging, capturing everything from fine-grained informational events to the most severe problems.

### Usage:

This logger can be imported in other parts of the application to log various types of information based on the application's needs. The TRACE level means that every detail of operation will be logged, which is useful for debugging but might be verbose for a production environment.

# stringsPhrase.ts

The file `stringsPhrase.json` from the `ferrumnet/gateway-backend` repository contains a series of key-value pairs that represent various error and success messages used throughout the backend system. These messages are typically used for providing feedback to API clients about the results of their requests, indicating errors, success states, or informative messages related to the application's operations.

Here is an overview of some key entries:

1.  Error Messages:

    - `Baakend_Error_Signature_Verification_Failed`: Indicates a failure in verifying a cryptographic signature.
    - `Backend_Error_Active_Product_Required`: Required when an operation needs an active product but none is set.
    - `Backend_Error_Already_Pledged`: Returned when a user tries to pledge to a raise pool they have already pledged to.
    - `Backend_Error_Api_Key_Is_Invalid`: Indicates that the provided API key is invalid.

2.  Success Messages:

    - `Backend_Success_ContractToken_Address_Is_Unique`: Confirms that the Contract Token Address is unique.
    - `Backend_Success_Otp`: Indicates that a One-Time Password (OTP) has been sent to the user's email.
    - `Backend_Success_Reset_Password_Link`: Indicates that a password reset link has been sent to the user's verified email address.

3.  Generic Messages:

    - `Backend_No_StepFlow_History_Available`: Indicates that there is no history available for the specified step flow for the user.
    - `Backend_Error_Previous_Sequence_Not_Completed`: Occurs when an attempt is made to restart a workflow sequence that has not been completed.

This JSON file is essential for managing and centralizing user feedback within the system, ensuring consistent messaging across different parts of the application.
