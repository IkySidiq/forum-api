# Forum API Starter Project

Forum API Starter Project is a simple forum backend built with **Hapi.js** and **PostgreSQL**, implementing JWT authentication, threads, comments, and replies.

---

## Features

- User registration and authentication
- Thread creation and retrieval
- Commenting and replying
- Token refresh and logout
- Soft deletion for comments and replies

---

## Technology Stack

- Node.js
- Hapi.js
- PostgreSQL
- JWT (@hapi/jwt)
- Jest for testing
- Nodemon for development

---

## Setup Environment Variables

Create a `.env` file in the root directory and fill in your own values:

```env
# HTTP SERVER
HOST=localhost
PORT=5000

# POSTGRES
PGHOST=your_postgres_host
PGUSER=your_postgres_user
PGDATABASE=your_postgres_database
PGPASSWORD=your_postgres_password
PGPORT=5432

# POSTGRES TEST
PGHOST_TEST=your_postgres_host
PGUSER_TEST=your_postgres_user
PGDATABASE_TEST=your_test_database
PGPASSWORD_TEST=your_postgres_password
PGPORT_TEST=5432

# TOKENIZE
ACCESS_TOKEN_KEY=your_access_token_secret
REFRESH_TOKEN_KEY=your_refresh_token_secret
ACCESS_TOKEN_AGE=3000
```

# Install Depedencies
npm install

# Database Migration
__Run the migrations for development:__
npm run migrate

__Run the migrations for test:__
pnpm run migrate:test

# Running the Server
pnpm run start        # production
pnpm run start:dev    # development with nodemon

# Testing
pnpm run test
pnpm run test:watch
pnpm run test:watch:change
pnpm run clear:jest

# Script Overview
- start – run server in production
- start:dev – run server with nodemon for development
- test – run all Jest tests
- migrate – run database migrations
- migrate:test – run migrations on test database
- lint – check code style with ESLint
- lint:fix – auto-fix lint issues

# API Endpoints
__Users__

Register User
POST /users

Request Body:
```js
{
  "username": "johndoe",
  "password": "secretpassword",
  "fullname": "John Doe"
}
```

Response:
```js
{
  "status": "success",
  "data": {
    "addedUser": {
      "id": "user-123",
      "username": "johndoe",
      "fullname": "John Doe"
    }
  }
}
```

__Authentications__

Login
POST /authentications
Request Body:
```js
{
  "username": "johndoe",
  "password": "secretpassword"
}
```

Response:
```js
{
  "status": "success",
  "data": {
    "accessToken": "access_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

Refresh Access Token
PUT /authentications
Request Body:
```js
{
  "refreshToken": "refresh_token_here"
}
```

Response:
```js
{
  "status": "success",
  "data": {
    "accessToken": "new_access_token_here"
  }
}
```

Logout
DELETE /authentications
Request Body:
```js
{
  "refreshToken": "refresh_token_here"
}
```

Response:
```js
{
  "status": "success"
}
```
__Threads__

Create Thread
POST /threads
Headers: Authorization: Bearer access_token_here
Request Body:
```js
{
  "title": "Thread title",
  "body": "Thread body content"
}
```

Response:
```js
{
  "status": "success",
  "data": {
    "addedThread": {
      "id": "thread-123",
      "title": "Thread title",
      "owner": "user-123"
    }
  }
}
```

Get Thread by ID
GET /threads/{threadId}
Response:
```js
{
  "status": "success",
  "data": {
    "thread": {
      "id": "thread-123",
      "title": "Thread title",
      "body": "Thread body content",
      "date": "2025-09-23T12:00:00Z",
      "username": "johndoe",
      "comments": [
        {
          "id": "comment-123",
          "content": "Comment content",
          "date": "2025-09-23T12:05:00Z",
          "username": "janedoe",
          "replies": [
            {
              "id": "reply-123",
              "content": "Reply content",
              "date": "2025-09-23T12:10:00Z",
              "username": "johndoe"
            }
          ]
        }
      ]
    }
  }
}
```
__Comments__

Add Comment
POST /threads/{threadId}/comments
Headers: Authorization: Bearer access_token_here
Request Body:
```js
{
  "content": "Comment content"
}
```

Response:
```js
{
  "status": "success",
  "data": {
    "addedComment": {
      "id": "comment-123",
      "content": "Comment content",
      "owner": "user-123"
    }
  }
}
```

Delete Comment
DELETE /threads/{threadId}/comments/{commentId}
Headers: Authorization: Bearer access_token_here
Response:
```js
{
  "status": "success"
}
```
__Replies__

Add Reply
POST /threads/{threadId}/comments/{commentId}/replies
Headers: Authorization: Bearer access_token_here
Request Body:
```js
{
  "content": "Reply content"
}
```

Response:
```js
{
  "status": "success",
  "data": {
    "addedReply": {
      "id": "reply-123",
      "content": "Reply content",
      "owner": "user-123"
    }
  }
}
```

Delete Reply
DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}
Headers: Authorization: Bearer access_token_here
Response:
```js
{
  "status": "success"
}
```