# Comments Model

## Overview

- **Collection**: `comment`
- **Labels**: Comment, Comments

## Fields

| Field | Type | Operations | Default | Description |
|-------|------|------------|---------|-------------|


## Operations


### Create
```javascript
const result = await API.DB.comment.create({ values: { /* ... */ } });
```

### Read
```javascript
const item = await API.DB.comment.read({ where: { _id: 'id' } });
```

### Read All
```javascript
const items = await API.DB.comment.readAll({ where: { /* ... */ } });
```

### Update
```javascript
const result = await API.DB.comment.update({ 
  where: { _id: 'id' }, 
  values: { /* ... */ } 
});
```

### Delete
```javascript
const result = await API.DB.comment.delete({ where: { _id: 'id' } });
```


## Filters

No filters defined for this model.

## Examples


### Creating a Comments
```javascript
const newComments = await API.DB.Comments.create({
  values: {
    // Add your field values here
  }
});
```

### Finding Commentss
```javascript
const commentss = await API.DB.Comments.readAll({
  where: {
    // Add your query conditions
  }
});
```


---

*Generated on 2025-05-28T13:50:53.523Z*
