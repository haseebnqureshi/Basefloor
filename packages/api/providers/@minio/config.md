# MinIO Local Provider Configuration

This provider allows you to use MinIO as a local file storage option for your MinAPI application.

## Installation

First, make sure you have installed the required dependency:

```bash
npm install minio --save
```

## Running MinIO Locally

You need to have MinIO running locally. The easiest way is to use Docker:

```bash
docker run -p 9000:9000 -p 9001:9001 \
  --name minio \
  -v ~/minio/data:/data \
  -e "MINIO_ROOT_USER=miniouser" \
  -e "MINIO_ROOT_PASSWORD=miniopassword" \
  minio/minio server /data --console-address ":9001"
```

This will:
- Start MinIO server on port 9000
- Make the MinIO console available on port 9001
- Store data in `~/minio/data` on your host machine
- Set the root user to "miniouser" and password to "miniopassword"

You can access the MinIO Console at http://localhost:9001 with the credentials above.

## Configuration Parameters

Add this to your `env.json` file:

```json
{
  "Files": {
    "Provider": "@minio/files",
    "Config": {
      "endPoint": "localhost",
      "port": 9000,
      "useSSL": false,
      "access": "miniouser",
      "secret": "miniopassword",
      "bucket": "minapi",
      "region": "us-east-1",
      "cdn": "http://localhost:9000/minapi",
      "defaultAcl": "public-read"
    }
  }
}
```

### Parameters

- `endPoint`: MinIO server hostname (default: "localhost")
- `port`: MinIO server port (default: 9000)
- `useSSL`: Whether to use SSL (default: false)
- `access`: MinIO access key
- `secret`: MinIO secret key
- `bucket`: The bucket name to use
- `region`: The region for bucket creation (default: "us-east-1")
- `cdn`: The URL prefix for accessing files (default: constructed from endPoint, port, and bucket)
- `defaultAcl`: Default access control for new buckets (use "public-read" to make files publicly accessible)

## Notes for macOS M4 Users

The standard MinIO Docker image works with M4 chips as it's available for ARM64 architecture. If you experience any issues, make sure you're using the latest version of Docker Desktop for Mac. 