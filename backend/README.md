# AWS Infrastructure Chat Assistant Backend

A production-quality Proof of Concept (POC) backend service powered by Node.js, Express, Prisma ORM, PostgreSQL, AWS SDK v3, and Google Gemini AI.

---

## 🌟 Features

- **Natural Language AWS Querying**: Conversational interface translating user prompt into AWS EC2 read commands using Gemini AI.
- **Strict Read-Only Guardrails**: Automatically blocks write/destructive operations (e.g. `Create EC2`, `Terminate EC2`, `Start Instance`, `Stop Instance`) without contacting AWS.
- **Secure AWS Credential Storage**: AES-256 encrypted AWS Secret Access Keys stored at rest. Decrypted only in-memory during request execution.
- **Audit Logging & History**: Comprehensive audit logging for all operations and user interaction history retrieval.
- **Robust Security**: Protected with JWT Authentication, Helmet security headers, CORS policies, bcrypt password hashing, and express-validator inputs.

---

## 📂 Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── aws.js                 # AWS region constants & mappings
│   │   ├── db.js                  # Prisma database client instance
│   │   └── gemini.js              # Google Gemini AI client
│   ├── controllers/
│   │   ├── audit.controller.js    # Audit log operations
│   │   ├── auth.controller.js     # User authentication (register/login/me)
│   │   ├── awsProfile.controller.js # AWS credential management
│   │   ├── chat.controller.js     # Natural language chat execution
│   │   └── history.controller.js  # Chat history management
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT protection middleware
│   │   └── error.middleware.js    # Centralized error handler
│   ├── routes/
│   │   ├── audit.routes.js        # /api/audit routes
│   │   ├── auth.routes.js         # /api/auth routes
│   │   ├── awsProfile.routes.js   # /api/aws-profile routes
│   │   ├── chat.routes.js         # /api/chat routes
│   │   └── history.routes.js      # /api/history routes
│   ├── services/
│   │   ├── aws.service.js         # AWS SDK v3 EC2 client & commands
│   │   ├── encryption.service.js  # AES-256 encryption/decryption
│   │   └── gemini.service.js      # Gemini AI intent extraction & JSON parsing
│   ├── utils/
│   │   ├── jwt.js                 # JWT sign and verify helpers
│   │   └── logger.js              # Sanitized application logger
│   ├── app.js                     # Express middleware & app setup
│   └── server.js                  # HTTP server entrypoint
├── prisma/
│   └── schema.prisma              # Database models & relationships
├── .env.example                   # Environment configuration template
├── package.json                   # Project dependencies & scripts
└── README.md                      # Comprehensive backend documentation
```

---

## 🔧 Prerequisites

- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: Local or remote instance
- **Google Gemini API Key**: Obtainable from Google AI Studio

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the `backend/` directory by copying `.env.example`:

```bash
cp .env.example .env
```

Configure your parameters in `.env`:

```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/aws_chat_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
ENCRYPTION_KEY="your-32-byte-aes-256-encryption-key"
GEMINI_API_KEY="your-google-gemini-api-key"
```

---

## 🚀 Installation & Database Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Prisma Migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

---

## 🏃 Running the Backend

- **Development Mode** (with hot reload via Nodemon):
  ```bash
  npm run dev
  ```

- **Production Mode**:
  ```bash
  npm start
  ```

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account | ❌ No |
| `POST` | `/api/auth/login` | Log in user and receive JWT token | ❌ No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | ✅ Yes |

### 🔑 AWS Profile (`/api/aws-profile`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/aws-profile` | Save AWS credentials (secret key encrypted) | ✅ Yes |
| `GET` | `/api/aws-profile` | Fetch user's saved AWS profile configuration | ✅ Yes |
| `PUT` | `/api/aws-profile` | Update user's AWS profile credentials | ✅ Yes |
| `DELETE` | `/api/aws-profile` | Delete user's AWS profile configuration | ✅ Yes |

### 🤖 Chat Assistant (`/api/chat`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/chat` | Submit natural language query (e.g. "List running EC2 instances in Mumbai") | ✅ Yes |

### 📜 Chat History (`/api/history`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/history` | Get user's past query and response history | ✅ Yes |
| `DELETE` | `/api/history` | Clear user's chat history | ✅ Yes |

### 🔍 Audit Logs (`/api/audit`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/audit` | Fetch audit logs for all AWS requests | ✅ Yes |

---

## 🛡️ Operational Policy (Read-Only Guardrails)

Supported AWS Operations:
- `describe_instances` (Read-only EC2 instance queries)

Supported Filters:
- `instance-state-name` (`running`, `stopped`, etc.)
- `instance-type` (`t2.micro`, `t3.medium`, etc.)
- `tag:Name` (Instance Name tags)

Unsupported Operations (Blocked automatically without calling AWS):
```json
{
  "message": "This POC supports only read-only AWS operations."
}
```
