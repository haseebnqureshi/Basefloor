---
layout: default
title: Models Reference
---

# MinAPI Models Reference

The models system in MinAPI is a powerful abstraction over MongoDB collections that provides schema validation, CRUD operations, and data transformations.

## Model Definition

Models are defined in the `models` section of your `minapi.config.js` file:

```javascript
models: {
  Users: {
    collection: 'user',
    labels: ['User', 'Users'],
    values: {
      _id: ['ObjectId', 'rd'],
      email: ['String', 'cru'],
      password_hash: ['String', 'c'],
      created_at: ['Date', 'r'],
      updated_at: ['Date', 'r']
    },
    filters: {
      // Filter functions
    }
  }
}
```

## Model Properties

### collection

The name of the MongoDB collection this model represents:

```javascript
collection: 'user'
```

### labels

Human-readable labels for the model (singular and plural):

```javascript
labels: ['User', 'Users']
```

### values

The schema definition for the model, which defines fields, their types, and CRUD permissions:

```javascript
values: {
  field_name: ['DataType', 'crudOperations', defaultValue]
}
```

Each field definition consists of:
1. `DataType`: The type of the field (`String`, `Number`, `Date`, `Boolean`, `ObjectId`, `Array`)
2. `crudOperations`: A string containing which operations are allowed:
   - `c`: Create - Field can be set when creating a record
   - `r`: Read - Field can be read
   - `u`: Update - Field can be updated
   - `d`: Delete - Field can be used in delete conditions
3. `defaultValue` (optional): Default value if none is provided

### filters

Functions that process data during CRUD operations:

```javascript
filters: {
  // Global filters
  where: (whereObject) => { /* modify and return whereObject */ },
  values: (valuesObject) => { /* modify and return valuesObject */ },
  output: (outputData) => { /* modify and return outputData */ },
  
  // Operation-specific filters
  create: {
    where: (whereObject) => { /* modify and return whereObject */ },
    values: (valuesObject) => { /* modify and return valuesObject */ }
  },
  // Additional operation filters...
}
```

## Database Operations

Once you have defined a model, MinAPI provides a set of database operations through the `API.DB` object:

### Create

```javascript
// Create a single document
const user = await API.DB.Users.create({
  email: 'user@example.com',
  password_hash: await API.Auth.hash('password123')
});

// Create multiple documents
const users = await API.DB.Users.createMany([
  { email: 'user1@example.com', password_hash: await API.Auth.hash('password123') },
  { email: 'user2@example.com', password_hash: await API.Auth.hash('password456') }
]);
```

### Read

```javascript
// Read a single document by ID
const user = await API.DB.Users.read({ _id: '60d21b4667d0d8992e610c85' });

// Read with custom query
const user = await API.DB.Users.read({ email: 'user@example.com' });

// Read all documents matching criteria
const adminUsers = await API.DB.Users.readAll({ role: 'admin' });

// Read or create (returns existing document or creates new one)
const user = await API.DB.Users.readOrCreate(
  { email: 'user@example.com' }, // Where condition
  { email: 'user@example.com', password_hash: await API.Auth.hash('password123') } // Values to create if not found
);
```

### Update

```javascript
// Update a single document
const updatedUser = await API.DB.Users.update(
  { _id: '60d21b4667d0d8992e610c85' }, // Where condition
  { email: 'newemail@example.com' } // New values
);

// Update multiple documents
const result = await API.DB.Users.updateAll(
  { role: 'user' }, // Where condition
  { verified: true } // New values
);
```

### Delete

```javascript
// Delete a single document
const result = await API.DB.Users.delete({ _id: '60d21b4667d0d8992e610c85' });

// Delete multiple documents
const result = await API.DB.Users.deleteAll({ role: 'guest' });
```

## Filter System

Filters are powerful functions that can modify data during database operations.

### Filter Types

1. **Global filters**:
   - `where`: Modifies query conditions for all operations
   - `values`: Modifies data being saved to the database
   - `output`: Modifies data being returned from the database

2. **Operation-specific filters**:
   - `create.where` / `create.values`: For create operations
   - `createMany.where` / `createMany.values`: For createMany operations
   - `read.where`: For read operations
   - `readAll.where`: For readAll operations
   - `update.where` / `update.values`: For update operations
   - `updateAll.where` / `updateAll.values`: For updateAll operations
   - `delete.where`: For delete operations
   - `deleteAll.where`: For deleteAll operations

### Filter Execution Flow

When a database operation is performed, filters are applied in this order:
1. Global filters (if defined)
2. Operation-specific filters (if defined)
3. Sanitization based on the model's values definition

### Example Use Cases

#### Data Encryption/Decryption

```javascript
Users: {
  // ... other model properties
  filters: {
    values: (values) => {
      // Encrypt sensitive data before storing
      if (values.access_token) {
        values.access_token = API.Utils.tokenEncrypt(values.access_token);
      }
      return values;
    },
    output: (output) => {
      // Decrypt sensitive data when reading
      if (output && output.access_token) {
        output.access_token = API.Utils.tokenDecrypt(output.access_token);
      }
      return output;
    }
  }
}
```

#### Adding Timestamps

```javascript
Users: {
  // ... other model properties
  filters: {
    create: {
      values: (values) => {
        values.created_at = new Date();
        values.updated_at = new Date();
        return values;
      }
    },
    update: {
      values: (values) => {
        values.updated_at = new Date();
        return values;
      }
    }
  }
}
```

#### Access Control

```javascript
Posts: {
  // ... other model properties
  filters: {
    readAll: {
      where: (where) => {
        // Add tenant filtering for multi-tenant applications
        if (global.currentUser && !global.currentUser.is_admin) {
          where.organization_id = global.currentUser.organization_id;
        }
        return where;
      }
    }
  }
}
```

## Foreign Key Relationships

MinAPI uses a naming convention for foreign keys: use the collection name with `_id` suffix:

```javascript
models: {
  Users: {
    collection: 'user',
    // ...
  },
  Posts: {
    collection: 'post',
    values: {
      // ...
      user_id: ['ObjectId', 'cru'], // Reference to the user collection
    }
  }
}
```

## Best Practices

1. **Consistent Collection Naming**: Use singular form for collection names
2. **Field Naming Conventions**: Use snake_case for field names
3. **Foreign Keys**: Always use `collection_name_id` format
4. **Default Values**: Provide sensible defaults for required fields
5. **CRUD Permissions**: Be restrictive with permissions, especially for sensitive fields
6. **Keep Filters Pure**: Filters should not have side effects and should always return a value 