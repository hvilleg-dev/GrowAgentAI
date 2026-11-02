# API Reference

Complete REST API documentation for GrowAgentAI backend.

## Base URL

```
Development:  http://localhost:3001
Production:   https://api.growagentai.com (placeholder)
```

## Authentication

All endpoints require JWT token in header:

```
Authorization: Bearer {token}
```

**Get token:** `POST /auth/login`

## Endpoints Overview

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login & get token
- `POST /auth/refresh` - Refresh expired token
- `POST /auth/logout` - Logout

### Users
- `GET /users/profile` - Current user
- `PUT /users/profile` - Update profile
- `GET /users/:id` - User by ID (admin)
- `DELETE /users/:id` - Delete user

### Goals
- `GET /goals` - List user goals
- `POST /goals` - Create goal
- `GET /goals/:id` - Get goal details
- `PUT /goals/:id` - Update goal
- `DELETE /goals/:id` - Delete goal
- `POST /goals/:id/milestones` - Add milestone
- `PUT /goals/:id/milestones/:milestoneId` - Update milestone

### Coaching Sessions
- `GET /sessions` - List user sessions
- `POST /sessions` - Create session
- `GET /sessions/:id` - Get session
- `DELETE /sessions/:id` - Delete session
- `POST /sessions/:id/messages` - Send message
- `GET /sessions/:id/messages` - Get chat history
- `PUT /sessions/:id` - Update session

### Analytics
- `GET /analytics/goals` - Goal statistics
- `GET /analytics/sessions` - Session statistics
- `GET /analytics/progress` - Progress data
- `POST /analytics/export` - Export data

### Knowledge Base
- `GET /knowledge/search` - Search base (RAG)
- `GET /knowledge/categories` - List categories

## Detailed Endpoints

### POST /auth/login

Login and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

### POST /sessions

Create new coaching session.

**Request:**
```json
{
  "title": "Goal discussion",
  "goal_id": "uuid or null"
}
```

**Response (201):**
```json
{
  "id": "session-uuid",
  "user_id": "user-uuid",
  "title": "Goal discussion",
  "goal_id": null,
  "created_at": "2024-01-01T12:00:00Z",
  "grow_stage": "G",
  "messages_count": 0
}
```

### POST /sessions/:id/messages

Send message in session (streaming).

**Request:**
```json
{
  "content": "I want to improve my leadership skills",
  "role": "user"
}
```

**Response (200 - SSE Stream):**
```
event: start
data: {"id": "msg-uuid", "role": "assistant"}

event: content
data: {"delta": "Great! "}

event: content
data: {"delta": "Let's..."}

...

event: end
data: {"finish_reason": "stop"}
```

### GET /goals

List all user goals with pagination.

**Query Parameters:**
- `skip` (int) - Pagination offset (default: 0)
- `take` (int) - Pagination limit (default: 10)
- `status` (string) - Filter: "active", "completed", "archived"
- `sort` (string) - Sort by: "created", "updated", "progress"

**Response (200):**
```json
{
  "goals": [
    {
      "id": "goal-uuid",
      "title": "Learn TypeScript",
      "description": "Become proficient...",
      "status": "active",
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-15T12:00:00Z",
      "progress": 45,
      "grow_stage": "O",
      "milestones": [
        {
          "id": "milestone-uuid",
          "title": "Complete basics",
          "completed": true
        }
      ]
    }
  ],
  "total": 5,
  "skip": 0,
  "take": 10
}
```

### POST /knowledge/search

Search knowledge base using RAG.

**Request:**
```json
{
  "query": "How to set goals effectively",
  "limit": 5
}
```

**Response (200):**
```json
{
  "results": [
    {
      "id": "doc-id",
      "title": "Goal Setting Framework",
      "content": "Goals should be SMART...",
      "source": "01_marco_agente_coach_es.md",
      "relevance_score": 0.95
    }
  ]
}
```

## Rate Limiting

- **Free tier:** 100 requests/hour
- **Pro tier:** 1,000 requests/hour
- **Enterprise:** Custom

Headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640903200
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "INVALID_INPUT",
  "message": "Email is required",
  "details": {
    "field": "email",
    "reason": "required"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "INVALID_TOKEN",
  "message": "Token expired or invalid"
}
```

### 404 Not Found
```json
{
  "error": "NOT_FOUND",
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests",
  "retry_after": 3600
}
```

### 500 Server Error
```json
{
  "error": "INTERNAL_ERROR",
  "message": "Internal server error",
  "request_id": "req-uuid"
}
```

## Webhooks

Subscribe to events:

```
POST /webhooks
Content-Type: application/json
Authorization: Bearer {token}

{
  "url": "https://your-api.com/webhook",
  "events": ["goal.created", "session.completed"]
}
```

**Events:**
- `goal.created`
- `goal.updated`
- `goal.completed`
- `session.started`
- `session.completed`
- `milestone.achieved`

## Pagination

All list endpoints support pagination:

```
GET /goals?skip=0&take=10
```

**Response structure:**
```json
{
  "data": [...],
  "total": 100,
  "skip": 0,
  "take": 10
}
```

## Filtering

Support for advanced filtering:

```
GET /sessions?status=active&goal_id=abc123&sort=-created_at
```

## SDK/Libraries

Official client libraries:
- JavaScript/TypeScript: `@growagentai/sdk-js`
- Python: `growagentai-sdk`
- Go: `growagentai-sdk-go`

## Examples

### Complete Goal Tracking Flow

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}' \
  | jq -r '.access_token')

# 2. Create goal
GOAL=$(curl -X POST http://localhost:3001/goals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn TypeScript","description":"Complete mastery"}')

GOAL_ID=$(echo $GOAL | jq -r '.id')

# 3. Start coaching session
SESSION=$(curl -X POST http://localhost:3001/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"goal_id\":\"$GOAL_ID\"}")

SESSION_ID=$(echo $SESSION | jq -r '.id')

# 4. Send coaching message
curl -X POST "http://localhost:3001/sessions/$SESSION_ID/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"What are my first steps?"}' \
  -N  # Keep connection open for streaming
```

## Postman Collection

[Download Postman Collection](../assets/GrowAgentAI.postman_collection.json)

## GraphQL (Future)

GraphQL endpoint planned for v1.1

---

[Back to Docs](00_START_HERE.md) | [Frontend Guide](05_FRONTEND.md)
