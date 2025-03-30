# Files API Documentation

This document provides detailed information about the Files API endpoints and their usage.

## Authentication

All endpoints require authentication. You must include your authentication token in the request headers.

## Endpoints

### List Files

```http
GET /files/:_id?
```

Retrieves a list of files or a specific file if `_id` is provided.

**Parameters:**
- `_id` (optional): The unique identifier of the file

**Response:** 200 OK
```json
{
    "_id": "file_id",
    "hash": "md5_hash_of_file_metadata",
    "filename": "hash_based_filename.ext",
    "extension": ".ext",
    "user_id": "user_id",
    "name": "filename.ext",
    "size": 1234,
    "content_type": "application/pdf",
    "file_modified_at": "2024-02-15T12:00:00Z",
    "key": "storage_key",
    "url": "https://cdn.example.com/filename.ext",
    "provider": "storage_provider_name",
    "bucket": "storage_bucket_name",
    "uploaded_at": "2024-02-15T12:00:00Z",
    "parent_file": "parent_file_id"
}
```

### Download File

```http
GET /files/:_id/download
```

Downloads a specific file.

**Parameters:**
- `_id`: The unique identifier of the file
- `force` (query parameter, optional): Set to "true" to force download instead of preview

**Response:** 200 OK with file stream
- Sets appropriate Content-Type header
- Sets Content-Disposition header if force=true

### List Child Files

```http
GET /files/:_id/files
```

Retrieves all child files associated with a parent file.

**Parameters:**
- `_id`: The unique identifier of the parent file

**Response:** 200 OK
```json
[
    {
        "_id": "child_file_id",
        "hash": "md5_hash_of_file_metadata",
        "filename": "hash_based_filename.ext",
        "extension": ".ext",
        "user_id": "user_id",
        "name": "child_filename.ext",
        "size": 1234,
        "content_type": "application/pdf",
        "file_modified_at": "2024-02-15T12:00:00Z",
        "key": "storage_key",
        "url": "https://cdn.example.com/filename.ext",
        "provider": "storage_provider_name",
        "bucket": "storage_bucket_name",
        "uploaded_at": "2024-02-15T12:00:00Z",
        "parent_file": "parent_file_id"
    }
]
```

### Check Conversion Support

```http
GET /convert/:to?
```

Checks if conversion is supported for a specific file extension.

**Parameters:**
- `to`: The file extension to check for conversion support (without the dot prefix)

**Response:** 200 OK
```json
{
    "extension": ".pdf",
    "accepted": true,
    "to": ".png"
}
```

### Convert File

```http
POST /files/:_id/convert/:to?
```

Converts a file to a different format. If no target format is specified, the API will automatically detect the most suitable conversion format.

**Parameters:**
- `_id`: The unique identifier of the file to convert
- `to` (optional): The target format extension without the dot prefix (e.g., "pdf", "png"). If not provided, the API will auto-detect the most appropriate format.

**Response:** 200 OK
```json
[
    {
        "_id": "converted_file_id",
        "hash": "md5_hash_of_file_metadata",
        "filename": "hash_based_filename.ext",
        "extension": ".ext",
        "user_id": "user_id",
        "name": "converted_filename.ext",
        "size": 1234,
        "content_type": "application/pdf",
        "file_modified_at": "2024-02-15T12:00:00Z",
        "key": "storage_key",
        "url": "https://cdn.example.com/filename.ext",
        "provider": "storage_provider_name",
        "bucket": "storage_bucket_name",
        "uploaded_at": "2024-02-15T12:00:00Z",
        "parent_file": "original_file_id"
    }
]
```

### Update File

```http
PUT /files/:_id?
```

Updates file metadata.

**Parameters:**
- `_id` (optional): The unique identifier of the file(s) to update

**Request Body:**
```json
{
    "name": "new_filename.ext",
    // Other updateable fields
}
```

**Response:** 200 OK
```json
{
    "_id": "updated_file_id",
    "hash": "md5_hash_of_file_metadata",
    "filename": "hash_based_filename.ext",
    "extension": ".ext",
    "user_id": "user_id",
    "name": "new_filename.ext",
    "size": 1234,
    "content_type": "application/pdf",
    "file_modified_at": "2024-02-15T12:00:00Z",
    "key": "storage_key",
    "url": "https://cdn.example.com/filename.ext",
    "provider": "storage_provider_name",
    "bucket": "storage_bucket_name",
    "uploaded_at": "2024-02-15T12:00:00Z",
    "parent_file": "parent_file_id"
}
```

### Delete File

```http
DELETE /files/:_id?
```

Deletes a file or multiple files.

**Parameters:**
- `_id` (optional): The unique identifier of the file(s) to delete

**Response:** 200 OK
```json
{
    "acknowledged": true,
    "deletedCount": 1
}
```

### Upload File

```http
POST /files
```

Uploads a new file.

**Headers Required:**
- `Authorization`: Bearer token for authentication
- `Content-Type`: multipart/form-data
- `x-minapi-name`: Original filename with extension (e.g., "document.pdf")
- `x-minapi-size`: File size in bytes (e.g., "1234567")
- `x-minapi-type`: MIME type of the file (e.g., "application/pdf")
- `x-minapi-modified`: File's last modified timestamp in ISO format (e.g., "2024-02-15T12:00:00Z")

**Request Body:**
- File content as multipart/form-data

**Response:** 200 OK
```json
{
    "_id": "new_file_id",
    "hash": "md5_hash_of_file_metadata",
    "filename": "hash_based_filename.ext",
    "extension": ".ext",
    "user_id": "user_id",
    "name": "filename.ext",
    "size": 1234,
    "content_type": "application/pdf",
    "file_modified_at": "2024-02-15T12:00:00Z",
    "key": "storage_key",
    "url": "https://cdn.example.com/filename.ext",
    "provider": "storage_provider_name",
    "bucket": "storage_bucket_name",
    "uploaded_at": "2024-02-15T12:00:00Z"
}
```

## Error Responses

All endpoints may return the following error responses:

- 400 Bad Request: Invalid parameters or request
- 401 Unauthorized: Missing or invalid authentication
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource not found
- 500 Internal Server Error: Server-side error

Each error response includes an error message explaining the issue. 