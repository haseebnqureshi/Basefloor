module.exports = {
  "db": "@memory/db",
  "files": {
    "enabled": true,
    "provider": "@minio/files"
  },
  "providers": {
    "@memory/db": {},
    "@minio/files": {
      "endPoint": process.env.MINIO_ENDPOINT || "localhost",
      "port": parseInt(process.env.MINIO_PORT) || 9000,
      "useSSL": process.env.MINIO_USE_SSL === "true",
      "access": process.env.MINIO_ACCESS_KEY || "miniouser",
      "secret": process.env.MINIO_SECRET_KEY || "miniopassword",
      "bucket": process.env.MINIO_BUCKET || "basefloor-test",
      "region": "us-east-1",
      "cdn": `http://${process.env.MINIO_ENDPOINT || "localhost"}:${process.env.MINIO_PORT || 9000}/${process.env.MINIO_BUCKET || "basefloor-test"}`,
      "defaultAcl": "public-read"
    }
  },
  "models": {
    "Users": {
      "collection": "users",
      "labels": ["User", "Users"],
      "values": {
        "_id": ["ObjectId", "rd"],
        "name": ["String", "cru"],
        "email": ["String", "cru"],
        "password_hash": ["String", "c"],
        "email_verified": ["Boolean", "cru"],
        "created_at": ["Date", "r"],
        "updated_at": ["Date", "r"]
      },
      "filters": {
        "create": {
          "values": (values) => {
            values.created_at = new Date();
            values.updated_at = new Date();
            return values;
          }
        }
      }
    },
    "Files": {
      "collection": "files",
      "labels": ["File", "Files"],
      "values": {
        "_id": ["ObjectId", "rd"],
        "filename": ["String", "cru"],
        "originalName": ["String", "cru"],
        "size": ["Number", "cru"],
        "mimetype": ["String", "cru"],
        "path": ["String", "cru"],
        "url": ["String", "cru"],
        "user_id": ["ObjectId", "cr"],
        "parent_id": ["ObjectId", "cru"],
        "created_at": ["Date", "r"],
        "updated_at": ["Date", "r"]
      },
      "filters": {
        "create": {
          "values": (values) => {
            values.created_at = new Date();
            values.updated_at = new Date();
            return values;
          }
        },
        "update": {
          "values": (values) => {
            values.updated_at = new Date();
            return values;
          }
        }
      }
    }
  },
  "routes": {
    "/users(Users)": {
      "c": { "allow": "@req_user._id=@req_user._id" },
      "rA": { "allow": "@req_user._id=@req_user._id" },
      "r": { "allow": "@req_user._id=@req_user._id", "where": "_id" },
      "u": { "allow": "@user._id=@req_user._id", "where": "_id" },
      "d": { "allow": "@req_user._id=@req_user._id", "where": "_id" }
    }
  },
  "auth": {
    "registerRoute": "/register",
    "loginRoute": "/login",
    "userRoute": "/user",
    "jwtSecret": process.env.JWT_SECRET || "files-test-secret",
    "saltRounds": 10
  }
}