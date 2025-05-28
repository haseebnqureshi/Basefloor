# Posts Model

## Overview

- **Collection**: `post`
- **Labels**: Post, Posts

## Fields

| Field | Type | Operations | Default | Description |
|-------|------|------------|---------|-------------|


## Operations


### Create
```javascript
const result = await API.DB.post.create({ values: { /* ... */ } });
```

### Read
```javascript
const item = await API.DB.post.read({ where: { _id: 'id' } });
```

### Read All
```javascript
const items = await API.DB.post.readAll({ where: { /* ... */ } });
```

### Update
```javascript
const result = await API.DB.post.update({ 
  where: { _id: 'id' }, 
  values: { /* ... */ } 
});
```

### Delete
```javascript
const result = await API.DB.post.delete({ where: { _id: 'id' } });
```


## Filters

No filters defined for this model.

## Examples


### Creating a Posts
```javascript
const newPosts = await API.DB.Posts.create({
  values: {
    // Add your field values here
  }
});
```

### Finding Postss
```javascript
const postss = await API.DB.Posts.readAll({
  where: {
    // Add your query conditions
  }
});
```


---

*Generated on 2025-05-28T13:50:53.523Z*
