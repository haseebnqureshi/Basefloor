# Files Model

## Overview

- **Collection**: `file`
- **Labels**: File, Files

## Fields

| Field | Type | Operations | Default | Description |
|-------|------|------------|---------|-------------|
| _id | ObjectId | Read, Update, Delete | - | Unique identifier |
| user_id | ObjectId | Create, Read, Update | - | Reference to user |
| name | String | Create, Read, Update | - | Display name |
| description | String | Create, Read, Update | - | Detailed description |
| filename | String | Create, Read | - | - |
| provider | String | Create, Read, Update | - | - |
| bucket | String | Create, Read, Update | - | - |
| key | String | Create, Read, Update | - | - |
| url | String | Create, Read, Update | - | URL or link |
| uploaded_at | Date | Create, Read, Update | - | - |
| file_modified_at | Date | Create, Read, Update | - | - |
| hash | String | Create, Read, Update | - | Content hash |
| size | Number | Create, Read, Update | - | Size in bytes |
| content_type | String | Create, Read, Update | - | - |
| extension | String | Create, Read, Update | - | - |
| parent_file | ObjectId | Create, Read, Update | - | - |
| type | String | Read, Update | - | Type classification |
| flattened_at | Date | Create, Read, Update | - | - |
| flattened_pages | Object(ObjectId) | Create, Read, Update | - | - |

## Operations


### Create
```javascript
const result = await API.DB.file.create({ values: { /* ... */ } });
```

### Read
```javascript
const item = await API.DB.file.read({ where: { _id: 'id' } });
```

### Read All
```javascript
const items = await API.DB.file.readAll({ where: { /* ... */ } });
```

### Update
```javascript
const result = await API.DB.file.update({ 
  where: { _id: 'id' }, 
  values: { /* ... */ } 
});
```

### Delete
```javascript
const result = await API.DB.file.delete({ where: { _id: 'id' } });
```


## Filters

No filters defined for this model.

## Examples


### Creating a Files
```javascript
const newFiles = await API.DB.Files.create({
  values: {
    // Add your field values here
  }
});
```

### Finding Filess
```javascript
const filess = await API.DB.Files.readAll({
  where: {
    // Add your query conditions
  }
});
```


---

*Generated on 2025-05-28T13:50:53.523Z*
