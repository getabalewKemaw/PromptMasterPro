# PromptMaster Pro - Backend API

Backend API server for PromptMaster Pro mobile application.

## Tech Stack

- **Node.js** + **Express.js** - REST API server
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **OpenAI API** - GPT-based prompt generation
- **Hasab AI API** - Translation service
- **JWT** - Authentication

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Update the following in `.env`:
- `DATABASE_URL` - Your PostgreSQL connection string
- `OPENAI_API_KEY` - Your OpenAI API key
- `HASAB_API_KEY` - Your Hasab AI API key
- `JWT_SECRET` - A secure random string

### 3. Setup Database

Initialize Prisma and create the database schema:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Prompts
- `POST /api/prompts` - Create new prompt (protected)
- `GET /api/prompts` - Get user prompts (protected)
- `GET /api/prompts/:id` - Get specific prompt (protected)
- `DELETE /api/prompts/:id` - Delete prompt (protected)
- `PATCH /api/prompts/:id/favorite` - Toggle favorite (protected)

### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/category/:category` - Get templates by category
- `GET /api/templates/:id` - Get specific template

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic (OpenAI, Hasab)
│   └── index.ts         # Server entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── .env                 # Environment variables (not in git)
├── package.json
└── tsconfig.json
```

## Database Schema

- **User** - User accounts with authentication
- **Prompt** - User-generated prompts with translations
- **Template** - Reusable prompt templates

## License

ISC
