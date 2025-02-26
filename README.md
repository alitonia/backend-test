# Education API

## Description

This is a NestJS-based API for managing educational data, including students and teachers. It provides a set of
endpoints for teachers to perform administrative functions for their classes.

## Features

- Student management
- Teacher management
- Database integration with TypeORM
- API endpoints for teacher administrative functions

## Getting Started

### Prerequisites

- Node.js (v22 or later)
- npm (v6 or later)
- MySQL

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/alitonia/backend-test.git
   cd backend-test
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
    * Create a `.env` file in the root directory and add necessary configuration (database connection, etc.). You can
      copy the file `.env.sample` for simplicity.
    * NOTE: You have to create username, password and database in MySQL, according to what you input into the env file
    * NOTE: You should run MySQL on the default port 3306

### Running the API

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

The API will be available at `http://localhost:3000` by default.

## API Endpoints

1. Register students to a teacher
    - Endpoint: POST /api/register
    - Headers: Content-Type: application/json
    - Success response status: HTTP 204
    - Request body example:
      ```json
      {
        "teacher": "teacherken@gmail.com",
        "students": [
          "studentjon@gmail.com",
          "studenthon@gmail.com"
        ]
      }
      ```

2. Retrieve common students
    - Endpoint: GET /api/commonstudents
    - Success response status: HTTP 200
    - Request example: GET /api/commonstudents?teacher=teacherken%40gmail.com&teacher=teacherjoe%40gmail.com
    - Success response body example:
      ```json
      {
        "students": [
          "commonstudent1@gmail.com",
          "commonstudent2@gmail.com"
        ]
      }
      ```

3. Suspend a student
    - Endpoint: POST /api/suspend
    - Headers: Content-Type: application/json
    - Success response status: HTTP 204
    - Request body example:
      ```json
      {
        "student": "studentmary@gmail.com"
      }
      ```

4. Retrieve students for notifications
    - Endpoint: POST /api/retrievefornotifications
    - Headers: Content-Type: application/json
    - Success response status: HTTP 200
    - Request body example:
      ```json
      {
        "teacher": "teacherken@gmail.com",
        "notification": "Hello students! @studentagnes@gmail.com @studentmiche@gmail.com"
      }
      ```
    - Success response body example:
      ```json
      {
        "recipients": [
          "studentbob@gmail.com",
          "studentagnes@gmail.com",
          "studentmiche@gmail.com"
        ]
      }
      ```

## Testing

```bash
# Run e2e tests
npm run test:e2e
__NOTE__: This involves database modification. Only test on your __local environment__!
```

### Create fake data

```bash
npm run seed
```
