module.exports = {
  "db": "@memory/db",
  "providers": {
    "@memory/db": {},
    "@local/files": {
      "uploadDir": "./uploads",
      "maxFileSize": "10MB",
      "allowedTypes": ["image/*", "text/*", "application/pdf"]
    },
    "@openai/ai": {
      "apiKey": process.env.OPENAI_API_KEY || "test-key-disabled"
    },
    "@nodemailer/email": {
      "transport": {
        "service": "gmail",
        "auth": {
          "user": process.env.EMAIL_USER || "test@example.com",
          "pass": process.env.EMAIL_PASS || "test-pass"
        }
      }
    },
    "@openai/transcription": {
      "apiKey": process.env.OPENAI_API_KEY || "test-key-disabled"
    }
  },
  "routes": {
    "/users(Users)": {
      "c": { "allow": "@req_user._id=@req_user._id" },
      "rA": { "allow": "@req_user._id=@req_user._id" },
      "r": { "allow": "@req_user._id=@req_user._id", "where": "_id" },
      "u": { "allow": "@user._id=@req_user._id", "where": "_id" },
      "d": { "allow": "@req_user._id=@req_user._id", "where": "_id" }
    },
    "/files(Files)": {
      "c": { "allow": "@req_user._id=@req_user._id" },
      "rA": { "allow": "@req_user._id=@req_user._id" },
      "r": { "allow": "@file.user_id=@req_user._id", "where": "_id" },
      "u": { "allow": "@file.user_id=@req_user._id", "where": "_id" },
      "d": { "allow": "@file.user_id=@req_user._id", "where": "_id" }
    }
  },
  "auth": {
    "registerRoute": "/register",
    "loginRoute": "/login",
    "userRoute": "/user",
    "jwtSecret": process.env.JWT_SECRET || "comprehensive-test-secret",
    "saltRounds": 10
  }
}