# Models

This documentation is auto-generated from the Basefloor model definitions.

## Available Models

- [Files](./files.md) - File, Files
- [Users](./users.md) - User, Users

## ObjectId Handling

### Overview

BasefloorAPI uses MongoDB ObjectIds for document identification. When working with ObjectIds in database queries and comparisons, proper handling is crucial for data integrity.

### ObjectId Comparison Issues

**Problem**: ObjectId comparisons can fail when comparing ObjectId instances with string representations, leading to incorrect query results.

**Example of the Issue**:
```javascript
// This comparison might fail
const docId = new ObjectId("507f1f77bcf86cd799439011");
const queryId = "507f1f77bcf86cd799439011";

if (docId === queryId) {
  // This will be false even though they represent the same ID
}
```

### Best Practices

#### 1. String Normalization
Always convert ObjectIds to strings for comparison:

```javascript
// Correct approach
const docValueStr = docValue && docValue.toString ? docValue.toString() : docValue;
const queryValueStr = queryValue && queryValue.toString ? queryValue.toString() : queryValue;

if (docValueStr === queryValueStr) {
  // This comparison will work correctly
}
```

#### 2. Database Query Handling
When building database queries, ensure consistent ObjectId handling:

```javascript
// For _id fields, normalize both values
if (key === '_id') {
  const normalizedDocValue = docValue && docValue.toString ? docValue.toString() : docValue;
  const normalizedQueryValue = queryValue && queryValue.toString ? queryValue.toString() : queryValue;
  return normalizedDocValue === normalizedQueryValue;
}
```

#### 3. Model Field Types
In your model definitions, always specify ObjectId fields correctly:

```javascript
values: {
  _id: ['ObjectId', 'rd'],           // Primary key
  user_id: ['ObjectId', 'cr'],       // Foreign key reference
  parent_id: ['ObjectId', 'cru'],    // Optional foreign key
  // ... other fields
}
```

### Common Pitfalls

1. **Mixed Types**: Comparing ObjectId instances with strings without conversion
2. **Null Handling**: Not checking for null/undefined values before calling toString()
3. **Query Building**: Using ObjectId instances in where clauses without proper conversion

### Testing ObjectId Handling

When testing database operations, verify ObjectId comparisons work correctly:

```javascript
// Test that finds the correct record
const user = await API.DB.Users.create({ 
  values: { name: 'Test User', email: 'test@example.com' } 
});

// This should find the user correctly
const found = await API.DB.Users.read({ 
  where: { _id: user._id } 
});

// Verify the IDs match
assert(found._id.toString() === user._id.toString());
```

### Database Provider Implementation

If implementing custom database providers, ensure ObjectId comparison logic handles string conversion properly in the `matchesQuery` function or equivalent query matching logic.
