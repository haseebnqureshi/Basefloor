# update Model

## Overview

- **Collection**: `null`
- **Labels**: 

## Fields

| Field | Type | Operations | Default | Description |
|-------|------|------------|---------|-------------|


## Operations


### Create
```javascript
const result = await API.DB.null.create({ values: { /* ... */ } });
```

### Read
```javascript
const item = await API.DB.null.read({ where: { _id: 'id' } });
```

### Read All
```javascript
const items = await API.DB.null.readAll({ where: { /* ... */ } });
```

### Update
```javascript
const result = await API.DB.null.update({ 
  where: { _id: 'id' }, 
  values: { /* ... */ } 
});
```

### Delete
```javascript
const result = await API.DB.null.delete({ where: { _id: 'id' } });
```


## Filters

No filters defined for this model.

## Examples


### Creating a update
```javascript
const newupdate = await API.DB.update.create({
  values: {
    // Add your field values here
  }
});
```

### Finding updates
```javascript
const updates = await API.DB.update.readAll({
  where: {
    // Add your query conditions
  }
});
```


---

*Generated on 2025-05-28T13:50:53.523Z*
