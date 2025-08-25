# 📝 Notes App with AI Summarization

A full-stack notes application with AI-powered summarization, built with Laravel, Python (FastAPI), and React + TypeScript.

## 🏗️ Architecture

- **Backend**: Laravel 11 API with Sanctum authentication
- **AI Service**: Python FastAPI with Hugging Face Transformers
- **Frontend**: React + TypeScript + Vite
- **Database**: MySQL
- **Containerization**: Docker for Python service

## 🚀 Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- Docker & Docker Compose
- MySQL
- Hugging Face API Token (for fallback summarization)

### Backend Setup (Laravel)

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
composer install
```

3. Set up environment:

```bash
cp .env.example .env
php artisan key:generate
```

4. Configure database in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=notes
DB_USERNAME=root
DB_PASSWORD=your_password
```

5. Run migrations:

```bash
php artisan migrate
```

6. Start the server:

```bash
php artisan serve
```

Server will run on `http://localhost:8000`

### Python AI Service (Docker)

1. Navigate to Python service directory:

```bash
cd python_service
```

2. Create `.env` file:

```env
HUGGINGFACE_API_KEY=your_api_token
MODEL_NAME=t5-small
FALLBACK_MODEL=sshleifer/distilbart-cnn-12-6
```

3. Build and start Docker container:

```bash
docker-compose up --build python_service
```

Service will run on `http://localhost:5000`

#### AI Models

- Primary: `t5-small` (runs locally)
- Fallback: `sshleifer/distilbart-cnn-12-6` (via Hugging Face API)

### Frontend Setup (React + TypeScript)

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📡 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password",
    "password_confirmation": "password"
}
```

#### Login

```http
POST /api/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password"
}
```

#### Logout

```http
POST /api/logout
Authorization: Bearer {token}
```

### Notes Endpoints

All notes endpoints require authentication header: `Authorization: Bearer {token}`

#### Get All Notes

```http
GET /api/get-notes
```

#### Create Note

```http
POST /api/create-note
Content-Type: application/json

{
    "title": "My Note",
    "content": "Note content here"
}
```

#### Get Single Note

```http
GET /api/get-note/{note_id}
```

#### Update Note

```http
PUT /api/update-note/{note_id}
Content-Type: application/json

{
    "title": "Updated Title",
    "content": "Updated content"
}
```

#### Delete Note

```http
DELETE /api/delete-note/{note_id}
```

### AI Summarization Endpoint

```http
POST http://localhost:5000/summarize
Content-Type: application/json

{
    "text": "Your long text to summarize..."
}
```

## 🔄 Startup Order

1. Start Laravel backend:

```bash
cd backend && php artisan serve
```

2. Start Python service:

```bash
cd python_service && docker-compose up
```

3. Start Frontend:

```bash
cd frontend && npm run dev
```

## 🛠️ Tech Stack

- **Backend**: Laravel 11, MySQL, Sanctum Authentication
- **AI Service**: Python 3.11, FastAPI, Hugging Face Transformers
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Containerization**: Docker, Docker Compose

## 📝 Features

- User Authentication (Register/Login)
- Create, Read, Update, Delete Notes
- AI-powered Text Summarization
- Responsive Design
- Real-time Search
- Secure API Endpoints
- Error Handling & Validation

## 🔒 Security

- API Authentication using Laravel Sanctum
- Password Hashing
- CORS Protection
- Input Validation
- Note Ownership Validation
- Secure Environment Variables

## 🤔 Assumptions Made

1. **Note Summarization Flow**:

   - Users can either save the original content or generate a summary
   - Generated summaries are editable before saving
   - Minimum content length (100 characters) required for meaningful summarization
   - Summary replaces original content when saving

2. **User Experience**:

   - Users prefer immediate feedback (toast notifications)
   - Users want to see loading states during API calls
   - Users need the ability to edit summaries for accuracy
   - Mobile-first responsive design is essential

3. **Technical Assumptions**:
   - Local t5-small model is sufficient for basic summarization
   - Hugging Face API serves as reliable fallback
   - MySQL is sufficient for data storage needs
   - Server can handle concurrent summarization requests

## 🚀 Future Improvements

1. **Performance Optimizations**:

   - Implement Redis caching for frequently accessed notes
   - Cache successful summarizations to avoid duplicate processing
   - Add pagination for notes list
   - Implement infinite scroll for better performance

2. **Enhanced Features**:

   - Note categories/tags for better organization
   - Rich text editor with markdown support
   - Note sharing capabilities
   - Export notes to PD
   - Bulk operations (delete, categorize)
   - Note version history

3. **AI Enhancements**:

   - Multiple summarization models for different use cases
   - Adjustable summarization parameters (length, style)
   - Keyword extraction
   - Topic categorization
   - Related notes suggestions
   - Multiple language support

4. **Security & Reliability**:

   - Rate limiting for API endpoints
   - Two-factor authentication
   - Automated backups
   - Enhanced logging

5. **Developer Experience**:

   - End-to-end testing suite
   - CI/CD pipeline
   - Automated code quality checks
   - Entire development environment in Docker not just python alone


6. **Infrastructure**:

   - Load balancing for Python service
   - Horizontal scaling capabilities
   - Monitoring and alerting
   - Health checks for all services

7. **User Experience**:
   - Customizable themes
   - Keyboard shortcuts
   - Better accessibility (WCAG compliance)

8. **Data Management**:
   - Note archiving system
   - Recycle bin for deleted notes
   - Analytics dashboard
