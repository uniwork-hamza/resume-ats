# Resume ATS Backend

A comprehensive backend API for the Resume ATS (Applicant Tracking System) application built with Node.js, Express.js, Prisma, Supabase, and OpenAI.

## Features

- 🔐 **Authentication**: Complete auth system with Supabase integration
- 📄 **Resume Management**: CRUD operations for resumes with file upload support
- 💼 **Job Description Management**: Full job posting management
- 🤖 **AI Analysis**: OpenAI-powered resume analysis and optimization
- 🗄️ **Database**: PostgreSQL with Prisma ORM
- 🔒 **Security**: JWT tokens, input validation, rate limiting
- 📊 **Analytics**: Comprehensive statistics and reporting

## Tech Stack

- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth + JWT
- **AI**: OpenAI GPT-4
- **File Upload**: Multer
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (Supabase recommended)
- OpenAI API key
- Supabase account and project

## Setup Instructions

### 1. Environment Configuration

1. Copy the environment example file:
   ```bash
   cp env.example .env
   ```

2. Fill in your environment variables:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   
   # Database Configuration
   DATABASE_URL=your_supabase_database_url
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:5173
   ```

### 2. Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Push database schema to Supabase
npm run prisma:push
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Apply database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user
- `PATCH /profile` - Update user profile
- `PATCH /change-password` - Change password
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password

### Resume Routes (`/api/resumes`)

- `GET /` - Get all resumes (paginated)
- `GET /:id` - Get single resume
- `POST /` - Create new resume
- `PATCH /:id` - Update resume
- `DELETE /:id` - Delete resume
- `POST /:id/upload` - Upload resume file
- `GET /:id/download` - Download resume file
- `POST /:id/duplicate` - Duplicate resume

### Job Description Routes (`/api/jobs`)

- `GET /` - Get all job descriptions (paginated)
- `GET /:id` - Get single job description
- `POST /` - Create new job description
- `PATCH /:id` - Update job description
- `DELETE /:id` - Delete job description
- `POST /:id/duplicate` - Duplicate job description
- `GET /stats/overview` - Get job statistics

### Analysis Routes (`/api/analysis`)

- `GET /` - Get all analyses (paginated)
- `GET /:id` - Get single analysis
- `POST /` - Create new analysis
- `POST /:id/reanalyze` - Re-run analysis
- `DELETE /:id` - Delete analysis
- `POST /optimize` - Get optimization suggestions
- `GET /stats/overview` - Get analysis statistics

### User Routes (`/api/users`)

- `GET /dashboard` - Get dashboard statistics
- `GET /activity` - Get user activity timeline
- `GET /profile` - Get user profile with stats
- `GET /export` - Export user data (GDPR)
- `DELETE /account` - Delete user account

## API Response Format

All API responses follow this consistent format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional message"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "stack": "Error stack (development only)"
}
```

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

## File Upload

Resume files can be uploaded with the following constraints:
- Maximum file size: 5MB
- Allowed types: PDF, DOC, DOCX, TXT
- Files are stored in the `uploads/` directory

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Apply to all routes

## Database Schema

The application uses the following main models:

- **User**: User accounts and profiles
- **Resume**: Resume data and file information
- **JobDescription**: Job posting information
- **Analysis**: AI analysis results
- **SystemConfig**: System configuration

## Error Handling

The API includes comprehensive error handling:

- Input validation errors
- Database errors
- File upload errors
- OpenAI API errors
- Authentication errors

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with Joi
- Rate limiting
- CORS configuration
- Helmet security headers
- File type validation

## Development Commands

```bash
# Start development server
npm run dev

# Generate Prisma client
npm run prisma:generate

# Push schema changes
npm run prisma:push

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database URL
3. Set secure JWT secret
4. Configure CORS for production frontend URL
5. Set up SSL certificates
6. Configure reverse proxy (Nginx recommended)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, please create an issue in the repository or contact the development team. 