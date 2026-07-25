# AI-Powered AWS Infrastructure Chat Assistant

A production-quality Proof of Concept (POC) full-stack web application designed for querying AWS infrastructure using natural language. Powered by **Node.js**, **Express**, **Prisma ORM**, **PostgreSQL**, **AWS SDK v3**, **Google Gemini AI**, and **React (Vite + Tailwind CSS)**.

---

## 🌟 Key Features

- **Natural Language AWS Querying**: Conversational ChatGPT-style UI translating prompts into AWS EC2 read-only SDK commands.
- **Strict Read-Only Guardrails**: Write and destructive operations (`Create EC2`, `Terminate EC2`, `Start Instance`, `Stop Instance`, etc.) are automatically blocked without contacting AWS.
- **AES-256 Key Encryption**: AWS Secret Keys are encrypted at rest using AES-256 before database storage.
- **Audit Trails & Query History**: Automatic logging of all user queries, intent payloads, and status codes (`SUCCESS`, `REJECTED`, `FAILED`).
- **Complete Auth Flow**: JWT Authentication, password hashing via `bcryptjs`, protected routes, and interactive Toast notifications.
- **Docker Ready**: One-command orchestrator via `docker-compose.yml`.

---

## 🏗️ Project Architecture

```
aws_chat_ai/
├── backend/                   # Node.js + Express + Prisma API
│   ├── src/
│   │   ├── config/            # DB, AWS, and Gemini clients
│   │   ├── controllers/       # Auth, AWS Profile, Chat, History, Audit controllers
│   │   ├── middleware/        # Auth verification & centralized error handler
│   │   ├── routes/            # Express API endpoint definitions
│   │   ├── services/          # AWS SDK v3, Gemini AI parser, AES-256 encryption
│   │   ├── utils/             # JWT sign/verify & sanitized logger
│   │   ├── app.js             # Express configuration
│   │   └── server.js          # HTTP listener
│   ├── prisma/                # Prisma schema definitions
│   └── Dockerfile             # Backend Docker container
├── frontend/                  # React + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/        # ProtectedRoute, Sidebar, Navbar
│   │   ├── context/           # AuthContext & ToastContext
│   │   ├── pages/             # Login, Register, Dashboard, AWS Profile, Chat, History, Audit
│   │   ├── services/          # Axios instance with auth interceptor
│   │   ├── index.css          # Tailwind CSS tokens & glassmorphism
│   │   ├── App.jsx            # Router layout
│   │   └── main.jsx           # Entrypoint
│   ├── Dockerfile             # Frontend Docker container (Nginx)
│   └── nginx.conf             # Nginx reverse proxy configuration
├── docker-compose.yml         # PostgreSQL, Backend, and Frontend orchestrator
└── README.md                  # Comprehensive Documentation
```

---

## 🚀 Quick Start with Docker Compose

Ensure Docker and Docker Compose are installed on your system.

1. **Clone & Environment Setup**:
   Set your Google Gemini API Key in `docker-compose.yml` or export it in your environment:
   ```bash
   export GEMINI_API_KEY="your-google-gemini-api-key"
   ```

2. **Launch All Services**:
   ```bash
   docker-compose up --build
   ```

3. **Access the Applications**:
   - **Frontend App**: [http://localhost](http://localhost)
   - **Backend API**: [http://localhost:5000/health](http://localhost:5000/health)
   - **PostgreSQL Database**: `localhost:5432`

---

## 💻 Manual Local Development Setup

### 1. Backend Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Configure Environment (.env)
cp .env.example .env
# Edit DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY, GEMINI_API_KEY in .env

# 3. Synchronize Database & Generate Prisma Client
npx prisma db push
npx prisma generate

# 4. Start Development Server
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start Vite Dev Server
npm run dev
```

The frontend will be running at [http://localhost:3000](http://localhost:3000).

---

## 📡 API Endpoint Summary

| Category | Method | Endpoint | Auth | Description |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | ❌ | Register user account |
| **Auth** | `POST` | `/api/auth/login` | ❌ | Authenticate user & get JWT |
| **Auth** | `GET` | `/api/auth/me` | ✅ | Fetch active user profile |
| **AWS Profile** | `POST` | `/api/aws-profile` | ✅ | Save encrypted AWS credentials |
| **AWS Profile** | `GET` | `/api/aws-profile` | ✅ | Get current AWS profile status |
| **AWS Profile** | `PUT` | `/api/aws-profile` | ✅ | Update AWS credentials |
| **AWS Profile** | `DELETE` | `/api/aws-profile` | ✅ | Remove AWS credentials |
| **Chat** | `POST` | `/api/chat` | ✅ | Process natural language query |
| **History** | `GET` | `/api/history` | ✅ | List user chat query history |
| **History** | `DELETE` | `/api/history` | ✅ | Clear chat history |
| **Audit** | `GET` | `/api/audit` | ✅ | List security audit logs |

---

## 🛡️ Read-Only Guardrails & Security

- **Supported Operations**: `describe_instances` (Read-only EC2 instance queries)
- **Supported Region Mappings**: "Mumbai" $\rightarrow$ `ap-south-1`, "Virginia" $\rightarrow$ `us-east-1`, "Oregon" $\rightarrow$ `us-west-2`, "Ohio" $\rightarrow$ `us-east-2`.
- **Unsupported Request Rejection**: Any mutation operation (`create_ec2`, `terminate_ec2`, `start_instance`, etc.) immediately returns:
  ```json
  {
    "message": "This POC supports only read-only AWS operations."
  }
  ```
