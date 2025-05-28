# Users Model

## Overview

- **Collection**: `user`
- **Labels**: User, Users

## Fields

| Field | Type | Operations | Default | Description |
|-------|------|------------|---------|-------------|
| _id | ObjectId | Read, Delete | - | Unique identifier |
| email | String | Create, Read, Update | - | User email address |
| password | String | Create | - | Hashed password |
| created_at | Date | Read | - | Creation timestamp |
| updated_at | Date | Read | - | Last update timestamp |

## Operations


### Create
```javascript
const result = await API.DB.user.create({ values: { /* ... */ } });
```

### Read
```javascript
const item = await API.DB.user.read({ where: { _id: 'id' } });
```

### Read All
```javascript
const items = await API.DB.user.readAll({ where: { /* ... */ } });
```

### Update
```javascript
const result = await API.DB.user.update({ 
  where: { _id: 'id' }, 
  values: { /* ... */ } 
});
```

### Delete
```javascript
const result = await API.DB.user.delete({ where: { _id: 'id' } });
```


## Filters

No filters defined for this model.

## Examples


### Creating a Users
```javascript
const newUsers = await API.DB.Users.create({
  values: {
    // Add your field values here
  }
});
```

### Finding Users
```javascript
const users = await API.DB.Users.readAll({
  where: {
    // Add your query conditions
  }
});
```


---

*Generated on 2025-05-28T14:54:24.679Z*
