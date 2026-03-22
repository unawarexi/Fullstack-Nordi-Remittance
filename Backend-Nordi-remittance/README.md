# Remit Remittance Backend

A production-ready online banking and remittance platform backend built with Express.js, TypeScript, and MongoDB.

## 🏦 Features

### Core Banking
- **User Management**: Registration, authentication, profiles, KYC verification
- **Wallet/Accounts**: Multi-currency wallets, account management
- **Transactions**: Deposits, withdrawals, transfers, payment processing
- **Cards**: Virtual and physical card management, spending limits, controls
- **Loans**: Loan applications, credit scoring, repayment schedules
- **Investments**: Savings goals, investment portfolios, asset trading

### Security & Compliance
- **Authentication**: JWT-based auth with refresh tokens
- **2FA**: Two-factor authentication with TOTP (Google Authenticator compatible)
- **Fraud Detection**: Behavioral analysis, velocity rules, security events
- **Audit Logging**: Comprehensive audit trails for compliance
- **KYC/AML**: Identity verification, anti-money laundering screening

### Administration
- **Admin Dashboard**: Platform analytics, user management
- **Permission System**: Role-based access control (RBAC)
- **System Settings**: Configurable platform settings
- **Reporting**: Transaction reports, compliance reports

## 🛠 Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js 5.x
- **Language**: TypeScript 5.x
- **Database**: MongoDB 7.x with Mongoose ODM
- **Cache**: Redis for session caching and rate limiting
- **File Storage**: Cloudinary
- **Email**: Nodemailer with SMTP
- **Real-time**: Socket.IO for WebSocket connections

## 📁 Project Structure

```
Backend-remittance/
├── config/                 # Configuration files
│   ├── dbconfig.ts        # Database configuration
│   └── env.config.ts      # Environment configuration
├── controllers/           # Route handlers
│   ├── Auth.controller.ts
│   ├── Users.controller.ts
│   ├── Transaction.controller.ts
│   ├── Card.controller.ts
│   ├── Loans.controller.ts
│   ├── Investment.controller.ts
│   └── ... (12+ controllers)
├── core/
│   ├── errors/           # Custom error classes
│   ├── helpers/          # Utility functions
│   └── mail/             # Email templates
├── middleware/           # Express middleware
│   ├── Auth.middleware.ts
│   ├── Security.middleware.ts
│   ├── Kyc.middleware.ts
│   ├── core.middleware.ts
├── models/               # Mongoose schemas
│   ├── UserModel.ts
│   ├── TransactionModel.ts
│   └── ... (15+ models)
├── routes/               # API routes
├── services/             # External services
│   ├── cloudinary.service.ts
│   ├── kafka.service.ts
│   ├── mailer.service.ts
│   ├── redis.service.ts
│   └── websocket.service.ts
├── k8s/                  # Kubernetes manifests
├── nginx/                # Nginx configuration
├── scripts/              # Build and utility scripts
├── tests/                # Test files
└── types/                # TypeScript type definitions
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 7.x (local or Atlas)
- Redis (optional, for caching)
- Cloudinary account (for file uploads)
- SMTP server (for emails)

### Local Development

1. **Clone and install dependencies**
   ```bash
   cd Backend-remittance
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   ```

### Docker Development

```bash
# Start all services with hot reload
docker-compose -f docker-compose.dev.yml up

# Access services:
# - API: http://localhost:3000
# - MongoDB Express: http://localhost:8081
# - Redis Commander: http://localhost:8082
```

### Production Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or deploy to Kubernetes
kubectl apply -f k8s/
```

## 📚 API Documentation

### Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.remit.com/api/v1
```

### Endpoints Overview

| Module | Endpoint | Description |
|--------|----------|-------------|
| Auth | `/auth` | Authentication, registration, password reset |
| Users | `/users` | User profiles, KYC, settings |
| Accounts | `/accounts` | Wallets, balances, beneficiaries |
| Transactions | `/transactions` | Transfers, deposits, withdrawals |
| Cards | `/cards` | Virtual/physical cards, controls |
| Loans | `/loans` | Loan applications, payments |
| Investments | `/investments` | Savings goals, portfolios |
| Admin | `/admin` | Admin dashboard, user management |
| Fraud | `/fraud` | Fraud signals, cases, rules |
| Statistics | `/statistics` | Analytics, reports |
| Permissions | `/permissions` | RBAC management |
| Notifications | `/notifications` | User notifications |
| Attachments | `/attachments` | File uploads, KYC documents |
| Legal | `/legal` | Terms, consents, disputes |
| Integrations | `/integrations` | Webhooks, API keys |
| Security | `/security` | 2FA, sessions, devices |

### Health Check
```bash
GET /health           # Basic health check
GET /health/detailed  # Detailed health with service status
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run test:coverage # Run tests with coverage
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run typecheck    # TypeScript type checking
npm run docker:dev   # Start Docker development environment
npm run docker:prod  # Start Docker production environment
```

## 🔐 Environment Variables

See `.env.example` for all available configuration options:

- `NODE_ENV` - Environment (development/production/test)
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `ENCRYPTION_KEY` - Data encryption key (32 chars)
- `CLOUDINARY_*` - Cloudinary credentials
- `SMTP_*` - Email configuration

## 🐳 Docker

### Development
```bash
docker-compose -f docker-compose.dev.yml up
```

### Production
```bash
docker-compose up -d --profile production
```

## ☸️ Kubernetes

Deploy to Kubernetes cluster:

```bash
# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Check status
kubectl get pods -n remit
kubectl get svc -n remit
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- users.test.ts
```

## 📦 CI/CD

GitHub Actions workflow included for:
- Linting and type checking
- Unit tests with coverage
- Docker image building
- Security scanning with Trivy
- Automatic deployment to staging/production

## 🔒 Security Features

- **Rate Limiting**: Request throttling per IP/user
- **CORS**: Configurable cross-origin policies
- **Helmet**: Security headers
- **Input Sanitization**: XSS prevention
- **Data Encryption**: AES-256-GCM for sensitive data
- **Password Hashing**: bcrypt with configurable rounds
- **JWT**: Secure token-based authentication
- **2FA**: TOTP-based two-factor authentication

## 📄 License

Private - All rights reserved


### `npm start`

Run the production build (Must be built first).


### `npm run type-check`

Check for typescript errors.


## Additional Notes

- If `npm run dev` gives you issues with bcrypt on MacOS you may need to run: `npm rebuild bcrypt --build-from-source`. 
