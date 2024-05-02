# addresses.ts

### Import Statement

- `'use strict';`: Enforces strict parsing and error handling of your JavaScript code.
- `var mongoose = require("mongoose");`: Imports the Mongoose library, which provides a straight-forward, schema-based solution to model your application data with MongoDB.

### Schema Definition

- `var schema = mongoose.Schema({...});`: Defines a new Mongoose schema with various properties to structure the address data.

#### Fields in the Schema

1.  user:

    - `type`: ObjectId - Represents a MongoDB Object ID.
    - `ref`: 'users' - This is a reference to the `users` collection, indicating a relationship between this address and a user.

2.  network:

    - `type`: ObjectId - Represents a MongoDB Object ID.
    - `ref`: 'networks' - This is a reference to the `networks` collection, associating the address with a specific network.

3.  address:

    - `type`: String - Holds the address string.
    - `default`: Empty string - Defaults to an empty string if no address is provided.

4.  lastConnectedIpAddress:

    - `type`: String - Stores the last IP address that was connected.
    - `default`: Empty string.

5.  nonce:

    - `type`: String - A nonce used typically in cryptographic operations to ensure uniqueness.
    - `default`: Empty string.

6.  status:

    - `isAddressAuthenticated`:
      - `type`: Boolean - Indicates whether the address has been authenticated.
      - `default`: false - Defaults to false.
    - `ipAddress`:
      - `type`: String - Can store an IP address related to the status.
      - `default`: Empty string.
    - `updatedAt`:
      - `type`: Date - The last update date for the status.
      - `default`: new Date() - Sets the default to the current date and time.

7.  isActive:

    - `type`: Boolean - Marks whether the address entry is considered active.
    - `default`: true - Defaults to true, indicating active by default.

8.  createdAt:

    - `type`: Date - The date when the address was created.
    - `default`: new Date() - Defaults to the current date and time at creation.

9.  updatedAt:

    - `type`: Date - The date when the address was last updated.
    - `default`: new Date() - Defaults to the current date and time at update.

### Model Compilation

- `var addressesModel = mongoose.model("addresses", schema);`: Compiles the schema into a model which will be associated with the 'addresses' collection in the database.

### Module Export

- `module.exports = addressesModel;`: Exports the `addressesModel` so it can be used in other parts of the application.

# currencies.ts

Module Dependencies:

- `mongoose`: Used for managing relationships between data, provides schema validation, and is used to translate between objects in code and the representation of those objects in MongoDB.

Schema Definition (`schema`):

- `createdByUser`: References a `User` object by its MongoDB ObjectId. This field tracks the user who created the currency entry.
- `updatedByUser`: References a `User` object by its MongoDB ObjectId. This field tracks the user who last updated the currency entry.
- `createdByOrganization`: References an `Organization` object by its MongoDB ObjectId. This indicates the organization under which the currency was created.
- `currencyAddressesByNetwork`: An array of ObjectIds referencing `currencyAddressesByNetwork` objects. This field stores multiple network addresses associated with the currency.
- `name`: A string field to store the name of the currency. It has a default empty string.
- `nameInLower`: A string field storing the name of the currency in lowercase for easier searching or matching. It has a default empty string.
- `symbol`: A string field for the currency symbol. It has a default empty string.
- `logo`: A string field for storing the URL or path of the currency's logo.
- `totalSupply`: A number field representing the total supply of the currency. Defaults to 0.
- `isActive`: A boolean indicating whether the currency is active. Defaults to true.
- `isVisibleForPublicMenuItem`: A boolean indicating whether the currency should be visible in public menu items. Defaults to true.
- `valueInUsd`: A number field storing the value of the currency in USD. Defaults to 0.
- `valueInUsdUpdatedAt`: A date field storing the last update time of the USD value.
- `coinGeckoId`: A string field for storing the CoinGecko identifier of the currency.
- `usdValueConversionPath`: An array of strings representing the conversion path to calculate the currency's value in USD.
- `isCreatedFromBulk`: A boolean to check if the currency entry was created as part of a bulk operation. Defaults to false.
- `createdAt`: A date field with a default value of the current date, indicating when the currency entry was created.
- `updatedAt`: A date field with a default value of the current date, indicating when the currency entry was last updated.

Model Creation:

- `currenciesModel`: This is the model compiled from the defined schema and is associated with the 'currencies' collection in MongoDB.

Exports:

- The module exports the `currenciesModel`, allowing it to be used in other parts of the application where interacting with the currency data is required.

# currencyAddressesByNetwork.ts

### File Overview

This TypeScript file utilizes the Mongoose library to define a schema and model for storing data related to currency addresses associated with different networks. The data structure includes various attributes related to currencies, networks, and additional properties for managing currency operations.

### Mongoose Schema Definition

- network: A reference to another document in the "networks" collection.
- currency: A reference to another document in the "currencies" collection.
- networkDex: A reference to another document in the "networkDexes" collection.
- createdByOrganization: A reference to another document in the "organizations" collection.
- createdByusers: An array of references to documents in the "users" collection.
- tokenContractAddress: Stores the contract address as a string.
- isAllowedOnMultiSwap: Boolean flag to denote if the currency is allowed in multi-swap operations.
- isFeeToken: Boolean to indicate if the currency is used as a fee token.
- isBaseFeeToken: Boolean to indicate if the currency is a base fee token.
- baseFeeAmount: The amount of base fee if applicable.
- baseFeePercentage: The percentage of the base fee if applicable.
- positionForFeeToken: The positional order for fee token usage.
- isActive: Boolean to indicate if the currency address is active.
- isNonEVM: Boolean flag to specify whether the currency operates on a non-EVM (Ethereum Virtual Machine) network.
- decimals: Specifies the number of decimals for the currency.
- priority: A number indicating the priority of the currency.
- isNative: Boolean to indicate if the currency is native to the network.
- oneInchAddress: Stores the address used by 1inch protocols, if applicable.
- isDefault: Boolean to mark the currency as default.
- nonDefaultCurrencyInformation: An object holding information like name and symbol for non-default currencies.
- isCreatedFromBulk: Boolean to indicate if the entry was created from a bulk operation.
- sourceSlippage: The slippage percentage at the source.
- destinationSlippage: The slippage percentage at the destination.
- createdAt: Timestamp for when the document was created.
- updatedAt: Timestamp for when the document was last updated.

### Model Creation

- The schema is tied to a collection named `"currencyAddressesByNetwork"`.
- A model named `"currencyAddressesByNetwork"` is created using this schema, which facilitates creating, reading, updating, and deleting documents from the defined collection.

# gasFees.ts

- File Overview: This file defines a Mongoose model for gas fees associated with blockchain transactions. It is designed to interact with MongoDB to store and retrieve gas fee data.

- Variables:

  - `mongoose`: The Mongoose library imported to handle modeling and schema definition for MongoDB.
  - `collectionName`: A string representing the name of the MongoDB collection to store gas fee data.

- Schema Definition:

  - `schema`: A Mongoose Schema object that defines the structure of the gas fee data in the MongoDB database.
    - `maxFeePerGas`: The maximum fee per gas unit allowed for the transaction (as a string).
    - `maxPriorityFeePerGas`: The maximum priority fee per gas unit to expedite the transaction (as a string).
    - `gasLimit`: The gas limit for the transaction (as a string).
    - `type`: Type of transaction or additional descriptor (as a string).
    - `chainId`: The blockchain network identifier this fee applies to (as a string).
    - `isActive`: A boolean flag indicating if the fee setting is currently active.
    - `createdAt`: Timestamp of when the gas fee setting was created.
    - `updatedAt`: Timestamp of the last update to the gas fee setting.

- Model Creation:

  - `gasFeesModel`: The Mongoose model created by binding the `schema` to the `collectionName`, enabling CRUD operations on documents within the "gasFees" collection.

# index.ts

1.  Dynamic Module Importing:

    - The script uses Node.js's `fs` module to read all files in the current directory (`__dirname`).
    - It iterates over each file in the directory.

2.  Conditional Filtering:

    - The code excludes files named 'plugins' and 'index.js' from being processed. This is likely to prevent re-importing of plugins or the index file itself, avoiding potential circular dependencies or redundancy.

3.  Module Exporting:

    - For each file that passes the filter, the file name is transformed to construct a module name by removing its extension.
    - The first character of the module name is capitalized to adhere to a naming convention (possibly to match TypeScript or JavaScript class naming conventions).
    - The module is then required (imported) and exported dynamically. This allows other parts of the application to import these models conveniently using the constructed module names.

# multiswapNetworkFIBERInformations.ts

### File Overview

This TypeScript file defines a Mongoose model for managing information related to the multiswap network for the FIBER protocol. It is structured using the Mongoose library to interact with a MongoDB database, defining a schema for the `multiswapNetworkFIBERInformations` collection.

### Schema Definition

A `schema` is defined using `mongoose.Schema` with the following fields:

- rpcUrl: String type with default empty string. Represents the RPC URL for the network.
- fundManager: String type with default empty string. Represents the fund manager.
- fiberRouter: String type with default empty string. Possibly a router specific to FIBER protocol.
- router: String type with default empty string. A generic router address.
- foundryTokenAddress: String type with default empty string. Represents the token address associated with the foundry.
- forgeContractAddress: String type with default empty string. Address of the forge contract.
- forgeFundManager: String type with default empty string. Fund manager specific to the forge contract.
- weth: String type with default empty string. Represents the wrapped Ether address in the network.
- aggregateRouterContractAddress: String type with default empty string. Address of the aggregate router contract.
- createdAt: Date type with default value of the current date. Stores the creation timestamp of the record.
- updatedAt: Date type with default value of the current date. Stores the last update timestamp of the record.

The schema is associated with the `multiswapNetworkFIBERInformations` collection within the database.

### Model Export

The schema is compiled into a model named `multiswapNetworkFIBERInformations` using `mongoose.model`, and it is exported for use elsewhere in the application.

# networks.ts

### File Overview

This file defines a Mongoose model for network entities related to the Ferrum Network. It uses the Mongoose library to facilitate MongoDB interactions.

#### Schema Definition

- Schema Name: `networks`
- Fields:
  - `user`: Reference to the user who owns this network configuration. It references the `users` collection.
  - `name`: The name of the network as a string, defaults to an empty string.
  - `nameInLower`: Lowercase version of the network name for case-insensitive searching, defaults to an empty string.
  - `networkShortName`: A short abbreviation for the network, defaults to an empty string.
  - `ferrumNetworkIdentifier`: A unique identifier for the network within the Ferrum ecosystem, defaults to an empty string.
  - `chainId`: Identifies the chain within the Ethereum network or other EVM-compatible networks, defaults to an empty string.
  - `networkId`: A general identifier for the network, defaults to an empty string.
  - `rpcUrl`: URL to the RPC endpoint for the network, defaults to an empty string.
  - `blockExplorerUrl`: URL to the network's block explorer, defaults to an empty string.
  - `networkCurrencySymbol`: The symbol for the network's primary currency, defaults to an empty string.
  - `dexInputCurrencySymbolList`: An array of symbols representing currencies accepted as input on the network's decentralized exchanges.
  - `networkCurrencyAddressByNetwork`: References a model (not detailed here) that maps network currency addresses by network.
  - `isTestnet`: Boolean indicating whether this network is a test network, defaults to false.
  - `parentId`: Reference to a parent network, allowing for network hierarchies.
  - `isActive`: Boolean indicating if the network is active, defaults to true.
  - `isAllowedOnGateway`: Boolean indicating if the network is permitted to be used with the Ferrum gateway services, defaults to false.
  - `isAllowedOnMultiSwap`: Boolean indicating if the network is permitted for use with MultiSwap functionalities, defaults to false.
  - `logo`: URL or a path to the network's logo image, defaults to an empty string.
  - `publicRpcUrl`: A public RPC URL that can be used as an alternative to `rpcUrl`.
  - `backupRpcUrl`: A backup RPC URL to be used in case the main RPC URL fails.
  - `positionForMultiSwap`: Numerical position indicating the order of appearance or priority in MultiSwap, defaults to 0.
  - `multiSwapFiberRouterSmartContractAddress`: Smart contract address for the MultiSwap Fiber Router on this network, defaults to an empty string.
  - `multiswapNetworkFIBERInformation`: References a model (not detailed here) that stores information about MultiSwap Fiber configurations specific to the network.
  - `isNonEVM`: Boolean indicating if the network is not EVM compatible, defaults to false.
  - `isAllowedDynamicGasValues`: Boolean indicating if dynamic gas values are allowed on this network, defaults to false.
  - `threshold`: A numerical threshold used for various configurations, defaults to 0.
  - `createdAt`: Timestamp for when the network was created, defaults to the current date and time.
  - `updatedAt`: Timestamp for when the network was last updated, also defaults to the current date and time.

#### Model

- Model Name: `networks`
- The schema is attached to the `networks` model, which interacts with the `networks` collection in MongoDB.

# randomKeys.ts

### Overview:

- Filename: `randomKeys.ts`
- Directory: `/app/models/`
- Purpose: Defines a Mongoose schema and model for the `randomKeys` collection in MongoDB.

### Details:

1.  Module Imports and Setup:

    - `mongoose`: The file imports `mongoose`, a MongoDB object modeling tool designed to work in an asynchronous environment.
    - `collectionName`: A variable set to the string `"randomKeys"`, specifying the name of the MongoDB collection.

2.  Schema Definition:

    - The file defines a Mongoose schema named `schema` for the `randomKeys` collection. This schema defines the following fields:
      - `key`: A string field, initialized with a default empty string.
      - `isActive`: A boolean field to indicate if the key is active, with a default value of `true`.
      - `createdAt`: A date field that captures the date when a record is created, defaulting to the current date and time at creation.
      - `updatedAt`: A date field that captures the date when a record is updated, defaulting to the current date and time at update.

3.  Model Definition:

    - `randomKeysModel`: This model is created using the `mongoose.model()` function, which compiles the schema into a model. It takes two arguments: the name of the collection (`collectionName`) and the schema (`schema`).

4.  Export:

    - The model `randomKeysModel` is exported from the module, making it available for import in other parts of the application where database interaction with the `randomKeys` collection is needed.

This file sets up a basic Mongoose model which can be used for managing entries in a MongoDB collection named `randomKeys`, primarily dealing with operations like creation and updates of records.

# rpcNodes.ts

### Imports and Basic Setup

- `mongoose`: This file imports the `mongoose` library, which is used for modeling and mapping MongoDB data to JavaScript.
- `collectionName`: A variable set to the string `"rpcNodes"`, specifying the name of the collection in the MongoDB database.

### Schema Definition

- `schema`: Defines a new Mongoose schema for RPC nodes with the following fields:
  - `url`: A string that holds the URL of the RPC node. It defaults to an empty string if not provided.
  - `chainId`: A string representing the blockchain's chain ID associated with this node. Defaults to an empty string.
  - `address`: A string for storing the node's address. Defaults to an empty string.
  - `type`: A string that categorizes the node's type. It defaults to an empty string.
  - `isActive`: A boolean indicating whether the node is active. It defaults to `true`.
  - `createdAt`: A date indicating when the node entry was created. It defaults to the current date at the time of creation.
  - `updatedAt`: A date indicating when the node entry was last updated. It defaults to the current date at the time of update.

### Model Creation

- `nodeConfigurationsModel`: This line uses the defined schema to create a model that can be used to interact with the `rpcNodes` documents in the database. This model will facilitate creating, reading, updating, and deleting entries from the `rpcNodes` collection.

### Module Exports

- The `nodeConfigurationsModel` is exported from the module, allowing other parts of the application to interact with the `rpcNodes` collection through the defined Mongoose model.

# users.ts

### Functions and Methods

1.  emailValidate(input: any): boolean

    - A function that validates if the provided input is a valid email address.
    - Uses a regular expression to check if the input conforms to the standard email format.

2.  schema.statics.getHashedPassword(password: any): string

    - Static method on the schema that generates a hashed password using SHA-256.
    - Takes a password string as input and returns the hashed password in Base64 format.

3.  schema.methods.createAPIToken(): string

    - Instance method that creates an API token for a user.
    - Utilizes the user's ID and email to generate the token with a predefined expiration time.

4.  schema.methods.createProfileUpdateToken(token: any, signature: any): string

    - Instance method that creates a token used for profile updates.
    - Signs a payload consisting of a token and a signature using the application's JWT secret.

5.  schema.methods.toClientObject(): object

    - Instance method that prepares a user object to be sent to the client.
    - Removes sensitive data like passwords and authentication tokens from the object.

### Schema Definition

- Defines a Mongoose schema for a user with various fields such as `name`, `email`, `password`, and `isActive`, among others.
- Includes custom validation for the `email` field to ensure it is valid when saved to the database.
- The schema is defined to be part of the `users` collection in MongoDB.

### Model Export

- The defined schema is compiled into a Mongoose model named `users`, which is then exported for use elsewhere in the application.

# versionHistory.ts

### File Overview

This TypeScript file defines a Mongoose model for version history in a MongoDB database. It does not contain explicit functions, but rather a schema definition for storing version history of different components within the system.

### Schema Definition: `schema`

- Type: `mongoose.Schema`
- Description: Defines the structure for the version history data to be stored in MongoDB.
- Fields:
  - `walletsVersion`: Stores the version number of the wallets component as a `Number`.
  - `networksVersion`: Stores the version number of the networks component as a `Number`.
  - `cabnsVersion`: Stores the version number of the cabns component as a `Number`.

### Collection Configuration

- Collection Name: `versionHistory`
- Description: Specifies that the schema should be stored in the MongoDB collection named "versionHistory".

### Model Creation: `versionHistoryModel`

- Type: `mongoose.model`
- Description: Creates a model based on the defined schema. This model is used to interact with the data in the `versionHistory` collection.
- Parameters:
  - `"versionHistory"`: Name of the model.
  - `schema`: Reference to the schema defined earlier.

### Export

- The `versionHistoryModel` is exported for use in other parts of the application.

# walletByNetwork.ts

### File: `walletByNetwork.ts`

#### Overview

This TypeScript file uses Mongoose to define a MongoDB schema and model for "walletByNetwork". It is intended to interact with a MongoDB collection named `walletByNetwork` that associates wallets with networks along with additional metadata.

#### Schema Definition

- createdByUser: (ObjectId, ref: 'users') - This field stores a reference to a `users` document in MongoDB. It indicates the user who created this wallet-network association.
- updatedByUser: (ObjectId, ref: 'users') - Similar to `createdByUser`, this field stores a reference to a `users` document, but indicates the user who last updated this wallet-network association.
- wallet: (ObjectId, ref: 'wallets') - Stores a reference to a `wallets` document, linking the specific wallet to this entry.
- network: (ObjectId, ref: 'networks') - Stores a reference to a `networks` document, linking the specific network to this wallet.
- positionForWallet: (Number, default: 0) - An integer indicating the position or order of this wallet in relation to other wallets on the same network. Defaults to 0.
- isActive: (Boolean, default: true) - A boolean flag indicating whether this wallet-network association is active. Defaults to true.
- createdAt: (Date, default: new Date()) - The date and time when this document was created. Automatically set to the creation time.
- updatedAt: (Date, default: new Date()) - The date and time when this document was last updated. Automatically updated on modification.

#### Model Creation

- Model Name: `walletByNetwork`
- Schema Variable: `schema`
- The schema is applied to a Mongoose model named `walletByNetwork`, which is then exported for use elsewhere in the application.

# wallets.ts

### File: `wallets.ts`

typescript

Copy code

`'use strict';
var mongoose = require('mongoose');

var schema = mongoose.Schema({
createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
updatedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
name: { type: String, default: "" },
nameInLower: { type: String, default: ""},
logo: { type: String, default: "" },
isActive: { type: Boolean, default: true },
isNonEVM: { type: Boolean, default: false },

createdAt: { type: Date, default: new Date() },
updatedAt: { type: Date, default: new Date() }
},{ collection: 'wallets' });

var crucibleMintCapsModel = mongoose.model("wallets", schema);
module.exports = crucibleMintCapsModel;`

#### Schema Definition:

- `createdByUser`: References the `users` collection to indicate the user who created the wallet record. Uses MongoDB's ObjectId for referencing.
- `updatedByUser`: References the `users` collection to denote the user who last updated the wallet record. Uses MongoDB's ObjectId for referencing.
- `name`: A string to store the name of the wallet. It defaults to an empty string.
- `nameInLower`: Stores the name of the wallet in lowercase format for consistency in searches and comparisons, defaulting to an empty string.
- `logo`: A string to store the URL or a path to the wallet's logo image. It defaults to an empty string.
- `isActive`: A boolean flag to indicate whether the wallet is active. Defaults to `true`.
- `isNonEVM`: A boolean flag indicating if the wallet is for a non-EVM (Ethereum Virtual Machine) blockchain. Defaults to `false`.
- `createdAt`: Stores the date when the wallet record was created. Defaults to the current date.
- `updatedAt`: Stores the date when the wallet record was last updated. Defaults to the current date.

#### Collection:

- The data is stored in the MongoDB collection named `wallets`.

#### Model Export:

- `crucibleMintCapsModel`: The Mongoose model is created using the defined schema and is exported for use elsewhere in the application.
