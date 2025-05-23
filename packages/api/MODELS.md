# Basefloor Models Documentation

## Overview

The `models/index.js` file in Basefloor provides a powerful and flexible system for defining data models and their interactions with the database. This document explains how models work in Basefloor and how they can be customized through the `basefloor.config.js` file.

## Model Definition

Models in Basefloor are defined as JavaScript objects with specific properties that determine how data is stored, retrieved, and manipulated. Each model represents a collection in the database and defines the schema, validation rules, and behavior for that collection.

### Basic Model Structure

```javascript
models.ModelName = {
  collection: 'collection_name',
  labels: ['Singular', 'Plural'],
  values: {
    field_name: ['DataType', 'crudOperations', 'defaultValue?'],
    // more fields...
  },
  filters: {
    // Custom filters for modifying data
  }
}
```

- **collection**: The name of the database collection
- **labels**: Human-readable names for the model (singular and plural)
- **values**: Object defining the schema fields with their data types and allowed operations
- **filters**: Custom functions to modify data during database operations

## Values Definition

Each field in the `values` object follows this pattern:

```javascript
field_name: ['DataType', 'crudOperations', 'defaultValue?']
```

- **DataType**: The type of data (String, Number, Date, ObjectId, etc.)
- **crudOperations**: A string containing characters that represent which operations are allowed:
  - `c`: Create - field can be set during creation
  - `r`: Read - field can be read
  - `u`: Update - field can be updated
  - `d`: Delete - field can be included in delete conditions
  - `A`: Additional operations (like readAll)

## Filters System

The filters system is one of the most powerful features of Basefloor's model system. It allows you to intercept and modify data at various points in the CRUD operations lifecycle.

### Filter Types

Filters can be defined at multiple levels:

1. **Global filters**: Applied to all operations
2. **Operation-specific filters**: Applied only to specific operations (create, read, update, delete)

### Filter Structure

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
  createMany: {
    where: (whereObject) => { /* modify and return whereObject */ },
    values: (valuesObject) => { /* modify and return valuesObject */ }
  },
  read: {
    where: (whereObject) => { /* modify and return whereObject */ }
  },
  readAll: {
    where: (whereObject) => { /* modify and return whereObject */ }
  },
  readOrCreate: {
    where: (whereObject) => { /* modify and return whereObject */ },
    values: (valuesObject) => { /* modify and return valuesObject */ }
  },
  update: {
    where: (whereObject) => { /* modify and return whereObject */ },
    values: (valuesObject) => { /* modify and return valuesObject */ }
  },
  updateAll: {
    where: (whereObject) => { /* modify and return whereObject */ },
    values: (valuesObject) => { /* modify and return valuesObject */ }
  },
  delete: {
    where: (whereObject) => { /* modify and return whereObject */ }
  },
  deleteAll: {
    where: (whereObject) => { /* modify and return whereObject */ }
  }
}
```

### Error Handling

Basefloor includes built-in error handling for filters. If a filter function throws an error, the system will:

1. Log the error with details
2. Continue the operation with the original data (as if the filter wasn't applied)
3. Prevent the error from crashing the entire operation

This makes the system more robust and prevents filter errors from causing application failures.

## Use Cases for Filters

### 1. Data Encryption/Decryption

One of the most powerful applications of filters is encrypting sensitive data before storing it and decrypting it when reading:

```javascript
// In basefloor.config.js
module.exports = (API) => {
  return {
    models: {
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
    }
    // ... other configuration options
  }
}
```

### 2. Data Transformation

Filters can transform data formats:

```javascript
filters: {
  values: (values) => {
    // Convert date strings to Date objects
    if (values.birth_date && typeof values.birth_date === 'string') {
      values.birth_date = new Date(values.birth_date);
    }
    return values;
  }
}
```

### 3. Adding Computed Fields

```javascript
filters: {
  output: (output) => {
    if (output) {
      // Add a computed field
      output.full_name = `${output.first_name} ${output.last_name}`;
    }
    return output;
  }
}
```

### 4. Implementing Business Logic

```javascript
filters: {
  create: {
    values: (values) => {
      // Set default values or implement business logic
      values.status = 'pending';
      values.created_by_ip = getCurrentIP();
      return values;
    }
  }
}
```

### 5. Access Control

```javascript
filters: {
  readAll: {
    where: (where) => {
      // Add user-based filtering for multi-tenant applications
      const currentUser = getCurrentUser(); // Get user from some global context
      if (!currentUser.is_admin) {
        where.organization_id = currentUser.organization_id;
      }
      return where;
    }
  }
}
```

## Database Operations

Basefloor provides a comprehensive set of database operations that utilize these filters:

- **create**: Create a single document
- **createMany**: Create multiple documents
- **read**: Read a single document
- **readAll**: Read multiple documents
- **readOrCreate**: Read a document if it exists, or create it if it doesn't
- **update**: Update a single document
- **updateAll**: Update multiple documents
- **delete**: Delete a single document
- **deleteAll**: Delete multiple documents

Each operation applies the appropriate filters at the right time in the operation lifecycle.

## Customizing Models in basefloor.config.js

You can customize and extend models in your `basefloor.config.js` file:

```javascript
// basefloor.config.js
module.exports = (API) => {
  return {
    models: {
      // Override or extend existing models
      Files: {
        filters: {
          // Add custom filters for the Files model
          create: {
            values: (values) => {
              // Generate a hash for the file
              values.hash = generateFileHash(values);
              return values;
            }
          }
        }
      },
      
      // Define new models
      CustomModel: {
        collection: 'custom',
        labels: ['Custom', 'Customs'],
        values: {
          // Define schema
        },
        filters: {
          // Define filters
        }
      }
    }
    // ... other configuration options
  }
}
```

## Filter Execution Flow

When a database operation is performed, filters are applied in this order:

1. Global filters (if defined)
2. Operation-specific filters (if defined)
3. Sanitization based on the model's values definition

This allows for a flexible and powerful way to modify data at various points in the operation lifecycle.

## Best Practices

1. **Keep filters pure**: Filters should not have side effects
2. **Handle null/undefined values**: Always check if values exist before operating on them
3. **Return the modified object**: Always return the object from filter functions
4. **Use sanitization**: Let Basefloor's sanitization handle type conversion
5. **Document your filters**: Complex filters should be well-documented

## Example: Complete Model with Filters

```javascript
// In basefloor.config.js
models.SecureDocuments = {
  collection: 'secure_documents',
  labels: ['Secure Document', 'Secure Documents'],
  values: {
    _id: ['ObjectId', 'rud'],
    user_id: ['ObjectId', 'cru'],
    title: ['String', 'cru'],
    content: ['String', 'cru'],
    encrypted: ['Boolean', 'cru', true],
    created_at: ['Date', 'r'],
    updated_at: ['Date', 'r']
  },
  filters: {
    // Global filters
    values: (values) => {
      // Encrypt content if needed
      if (values.content && values.encrypted !== false) {
        values.content = API.Utils.tokenEncrypt(values.content);
        values.encrypted = true;
      }
      return values;
    },
    output: (output) => {
      // Decrypt content when reading
      if (output && output.content && output.encrypted) {
        output.content = API.Utils.tokenDecrypt(output.content);
      }
      return output;
    },
    
    // Operation-specific filters
    create: {
      values: (values) => {
        // Add metadata during creation
        values.created_by_ip = getCurrentIP();
        return values;
      }
    },
    update: {
      where: (where) => {
        // Add security checks
        const currentUser = getCurrentUser(); // Get user from some global context
        if (!currentUser.is_admin) {
          where.user_id = currentUser._id;
        }
        return where;
      }
    }
  }
}
```

This documentation provides a comprehensive overview of Basefloor's model system and how to leverage its powerful filtering capabilities to implement custom business logic, data transformation, encryption, and more. 