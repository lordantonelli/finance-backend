## Finance Backend — Quick Start

This repository is a NestJS API for personal finance management. Below are the minimal steps to run it locally and test the API.

## Requirements

- Node.js LTS and npm
- Windows PowerShell or your preferred shell

## 1) Install dependencies

```powershell
npm install
```

## 2) Create the .env file

Create a file named `.env` in the project root with the variables below:

```env
# Required
JWT_SECRET=your-strong-jwt-secret

# Optional (defaults to 3000)
PORT=3000
```

Notes:

- Use a strong random value for JWT_SECRET. For local development, any random string works. Do not commit real secrets.
- The database is SQLite and requires no configuration. A file will be created at `database/finance.db` on first run.

## 3) Run the API

```powershell
# development (watch mode)
npm run start:dev

# or single run
npm run start
```

When the server is running:

- API base URL: http://localhost:3000
- Swagger UI: http://localhost:3000/docs

## 4) Test login

Use this test user to explore the API:

- Email: humberto@teste.com
- Senha: StrongP@ssword1

If this user does not exist in your local database yet, you can create it via Swagger:

1. Open http://localhost:3000/docs
2. Expand POST /users
3. Send a payload with the email and password above
4. Then use POST /auth/login with the same credentials

That’s it — you’re ready to use the API.
