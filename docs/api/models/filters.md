# filters Model

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


### Creating a filters
```javascript
const newfilters = await API.DB.filters.create({
  values: {
    // Add your field values here
  }
});
```

### Finding filterss
```javascript
const filterss = await API.DB.filters.readAll({
  where: {
    // Add your query conditions
  }
});
```


---

*Generated on 2025-05-28T13:50:53.523Z*
