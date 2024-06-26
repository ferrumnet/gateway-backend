# asyncMiddleware.ts

### Function: `asyncMiddlewareLayer`

Parameters:

- `fn`: A function that takes three parameters `req`, `res`, and `next`. This is the middleware function you want to handle asynchronously.
  - `req` (any): The request object.
  - `res` (any): The response object.
  - `next` (any): The next middleware function in the stack.

Returns:

- The function returns another function that itself takes three parameters (`req`, `res`, `next`). This returned function does not have a return value (void).

Description:

- `asyncMiddlewareLayer` is a higher-order function designed to handle asynchronous operations within Express.js middleware functions. It ensures that any promises returned by the middleware are properly resolved and that errors are caught and handled.
- The function `fn` is invoked within a `Promise.resolve()` to ensure any thrown errors are caught. If the promise is rejected, the error is caught in the `.catch` block.

Error Handling:

- If an error occurs, the function attempts to handle it gracefully by checking the structure of the error object and modifying it if necessary to ensure meaningful error information is sent back in the HTTP response.
- The function checks several properties of the error object to determine the best error message to return. This includes checking `err.message`, `err.msg`, and other nested properties if available.
- After determining the appropriate error message, it uses `res.http400` to send a 400 HTTP response with the error message.
- If an error occurs in the error handling code itself, it catches it in a nested try-catch block and sends a generic 400 response using `res.http400`.

Usage:

- This middleware wrapper is used in scenarios where you want to ensure that asynchronous middleware does not lead to unhandled promises and provides consistent error handling across your API.

# responseAppender.ts

### File: `responseAppender.ts`

This file contains a middleware function that appends standardized HTTP response methods to the response object in an Express.js application. Below is the detailed breakdown:

#### Module Exports

- Function: Anonymous middleware function
- Parameters:
  - `req`: Express Request object. Represents the HTTP request and has properties for the request query string, parameters, body, HTTP headers, etc.
  - `res`: Express Response object. Used to send back the desired HTTP response.
  - `next`: Callback argument to the middleware function, which, when called, executes the middleware succeeding the current middleware.

#### Functionality

- Purpose: The function is used to augment the response object with custom methods that standardize the responses for different HTTP status codes.
- Operations:
  - `res.http200`: Appends the `http200` method from `standardResponses` to handle HTTP 200 status responses.
  - `res.http400`: Appends the `http400` method from `standardResponses` to handle HTTP 400 status responses.
  - `res.http401`: Appends the `http401` method from `standardResponses` to handle HTTP 401 status responses.
  - `res.http404`: Appends the `http404` method from `standardResponses` to handle HTTP 404 status responses.
- Flow:
  - Once the response methods are appended, it calls `next()` to pass control to the next middleware function in the stack.

#### Usage

This middleware can be added to specific routes or globally within an Express application to ensure that each response object in the route handlers has consistent methods for sending responses.

# standardResponses.ts

### 1\. `http200(data: any)`

- Purpose: Sends a 200 HTTP status code response with a custom message and data.
- Parameters:
  - `data`: An object that must contain a `message` and may contain a `phraseKey`. The `message` is used as the response message, and the `phraseKey` serves as a phrase identifier.
- Behavior:
  - Extracts `message` and `phraseKey` from the `data` object.
  - Deletes these properties from the `data` object.
  - Returns a JSON response with a `status` object (includes code, message, and phraseKey) and the modified `data` as the `body`.

### 2\. `http400(err: any, key: string = '')`

- Purpose: Sends a 400 HTTP status code response, typically used to indicate client-side errors.
- Parameters:
  - `err`: The error message or object to be sent in the response.
  - `key`: Optional phrase key to provide additional error context.
- Behavior:
  - Returns a response with a status code of 400 and a `status` object containing the error details and phrase key.

### 3\. `http401(err: any)`

- Purpose: Sends a 401 HTTP status code response, used to indicate authentication failures.
- Parameters:
  - `err`: The error message or object to indicate why authentication failed.
- Behavior:
  - Returns a response with a status code of 401 and a `status` object containing the error details.

### 4\. `http404(err: any, key: string = '')`

- Purpose: Sends a 404 HTTP status code response, used to indicate that a resource is not found.
- Parameters:
  - `err`: The error message or object to be sent in the response.
  - `key`: Optional phrase key to provide additional context about the error.
- Behavior:
  - Returns a response with a status code of 404 and a `status` object containing the error details and phrase key.

This documentation should provide a clear understanding of how each function operates within the context of handling standard HTTP responses.

# standardStatuses.ts

1.  `status200` function:

    - Parameters: `data: any`
      - `data`: The data to be included in the response payload.
    - Returns: An object representing a successful HTTP response.
    - Response Structure:
      - `code`: HTTP status code 200, indicating a successful request.
      - `data`: The payload data passed to the function.
    - Description: This function generates a response object for HTTP 200 status, typically used to indicate that a request has been successfully processed.

2.  `status400` function:

    - Parameters: `data: any`
      - `data`: The error message or data to be included in the response.
    - Returns: An object representing a client error response.
    - Response Structure:
      - `code`: HTTP status code 400, indicating a bad request.
      - `message`: A message or data indicating what went wrong.
    - Description: This function is used to construct a response for HTTP 400 status, which is generally used when the request was not processed due to an issue with the request itself.

3.  `status401` function:

    - Parameters: `data: any`
      - `data`: The error message or relevant data regarding the authentication failure.
    - Returns: An object representing an unauthorized request response.
    - Response Structure:
      - `code`: HTTP status code 401, indicating that the request lacks valid authentication credentials.
      - `message`: A message or data explaining why the request is unauthorized.
    - Description: This function creates a response for HTTP 401 status, used when a request requires user authentication which has not been provided or has failed.

These functions help in standardizing the API responses by ensuring that they adhere to the expected HTTP status codes and structures for different scenarios.
