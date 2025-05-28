# Users Model

## Overview

- **Collection**: `user`
- **Labels**: User, Users

## Fields

| Field | Type | Operations | Default | Description |
|-------|------|------------|---------|-------------|


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

### Finding Userss
```javascript
const userss = await API.DB.Users.readAll({
  where: {
    // Add your query conditions
  }
});
```


---

*Generated on 2025-05-28T13:50:53.523Z*
