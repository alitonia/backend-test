# Education API

## Description

This is a NestJS-based API for managing educational data, including students and teachers.

## Features

- Student management
- Teacher management
- Database integration with TypeORM

## Getting Started

### Prerequisites

- Node.js (v22 or later)
- npm (v6 or later)

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
   Create a `.env` file in the root directory and add necessary configuration (database connection, etc.).

### Running the API

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

The API will be available at `http://localhost:3000` by default.

## API Endpoints

- `/students`: Student-related operations
- `/teachers`: Teacher-related operations

For detailed API documentation, please refer to the API documentation (Swagger/OpenAPI) available at `/api` when the
server is running.

## Testing

```bash
# Run e2e tests
npm run test:e2e
__NOTE__: this involves database modification. Only test on your local environment !!!

```
### Create fake data

```bash
npm run seed
```
# backend-test
