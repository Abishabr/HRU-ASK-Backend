# Design Document: Express Error Handler Middleware

## Overview

This design establishes a centralized error handling middleware for an Express.js application. The error handler will catch all errors thrown in route handlers and middleware, provide consistent error responses, prevent application crashes, and log errors with full context. The implementation will support different behaviors for development and production environments and handle both operational errors (expected) and programming errors (unexpected).

The error handler integrates seamlessly with the existing JWT authentication middleware and will be applied as the last middleware in the Express application to catch all errors.

## Architecture

### Error Handler Position

The error handler must be registered as the **last middleware** in the Express application, after all routes and other middleware. This ensures it catches errors from any part of the request-response cycle.

```javascript
// app.js structure
app.use(express.json());
app.use('/', userRouter);
app.use('/', questionRouter);
app.use('/', answerRouter);
app.use(errorHandler);  // Must be last
```

### Error Flow

1. **Error occurs** in route handler or middleware
2. **Error is thrown** or passed to `next(error)`
3. **Express skips** remaining middleware and routes
4. **Error handler catches** the error
5. **Error is logged** with full context
6. **Response is sent** with appropriate status code and message
7. **Application continues** running (no crash)

### Directory Structure

```
middleware/
├── auth.js              (existing)
├── errorHandler.js      (new - error handling)
└── asyncHandler.js      (new - async error wrapper)

utils/
└── validate.js          (existing)
```

## Components and Interfaces

### 1. Error Handler Middleware

**Purpose:** Centralized error handling with consistent error responses

**Interface:**
```javascript
// middleware/errorHandler.js

export const errorHandler = (err, req, res, next) => {
  // Error processing logic
}
```

**Behavior:**
- Accepts four parameters (err, req, res, next) - Express error middleware signature
- Determines HTTP status code from error properties
- Formats error response based on environment
- Logs error with full context
- Sends JSON response to client
- Does not call `next()` - terminates error handling chain

**Error Response Format:**
```javascript
{
  status: 'error',
  statusCode: 400,
  message: 'Validation failed',
  requestId: req.id || 'unknown',
  errors: [...],  // Optional: for validation errors
  stack: '...'    // Only in development
}
```

**Status Code Determination:**
- If error has `statusCode` property, use it
- If error has `status` property, use it
- Otherwise, use 500 (internal server error)

**Error Type Detection:**
- Validation errors: Check for `errors` array property or statusCode 400
- Authentication errors: Check for statusCode 401
- Authorization errors: Check for statusCode 403
- Not found errors: Check for statusCode 404
- All others: Default to 500

**Environment-Specific Behavior:**
- **Development** (`NODE_ENV !== 'production'`):
  - Include full stack trace in response
  - Include original error message
  - Log detailed error information to console
  
- **Production** (`NODE_ENV === 'production'`):
  - Exclude stack trace from response
  - Use generic message for 500 errors ("Internal server error")
  - Log errors to console with full details
  - Never expose sensitive information

**Error Logging:**
```javascript
console.error('Error occurred:', {
  timestamp: new Date().toISOString(),
  requestId: req.id || 'unknown',
  method: req.method,
  path: req.path,
  statusCode: err.statusCode || err.status || 500,
  message: err.message,
  stack: err.stack,
  user: req.user?.id
});
```

### 2. Async Handler Wrapper

**Purpose:** Wrap async route handlers to catch promise rejections

**Interface:**
```javascript
// middleware/asyncHandler.js

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

**Behavior:**
- Wraps async route handler functions
- Catches promise rejections automatically
- Passes errors to Express error handling chain via `next(error)`
- Eliminates need for try-catch in every async route

**Usage Example:**
```javascript
import { asyncHandler } from './middleware/asyncHandler.js';

router.post('/users', asyncHandler(async (req, res) => {
  const user = await createUser(req.body);
  res.status(201).json(user);
  // No try-catch needed - asyncHandler catches errors
}));
```

### 3. Integration with Existing Auth Middleware

**Purpose:** Update auth middleware to pass errors to error handler

**Current auth.js:**
```javascript
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[0] === 'Bearer' ? authHeader.split(' ')[1] : null;
    if (!token) return res.status(401).json({ message: 'Access token required' });
    const secret = process.env.jwtSecret;
    try {
        const payload = jwt.verify(token, secret);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
```

**Updated auth.js:**
```javascript
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[0] === 'Bearer' ? authHeader.split(' ')[1] : null;
    
    if (!token) {
        const error = new Error('Access token required');
        error.statusCode = 401;
        return next(error);
    }
    
    const secret = process.env.jwtSecret;
    try {
        const payload = jwt.verify(token, secret);
        req.user = payload;
        next();
    } catch (err) {
        err.statusCode = 401;
        err.message = 'Invalid or expired token';
        return next(err);
    }
};
```

**Changes:**
- Create error objects with `statusCode` property
- Pass errors using `next(error)` instead of sending responses directly
- Let error handler format and send responses
- Maintains same behavior but with centralized error handling

## Data Models

### Error Object

```javascript
{
  message: string,           // Human-readable error message
  statusCode?: number,       // HTTP status code (400, 401, 403, 404, 500)
  status?: number,           // Alternative status property
  stack: string,             // Stack trace
  errors?: Array<{           // Optional: for validation errors
    field: string,
    message: string,
    value: any
  }>
}
```

### Error Response

```javascript
{
  status: 'error',           // Always 'error'
  statusCode: number,        // HTTP status code
  message: string,           // Error message
  requestId: string,         // Request identifier for tracing
  errors?: Array<object>,    // Optional: validation error details
  stack?: string             // Optional: stack trace (dev only)
}
```

### Error Log Entry

```javascript
{
  timestamp: string,         // ISO 8601 timestamp
  requestId: string,         // Request identifier
  method: string,            // HTTP method
  path: string,              // Request path
  statusCode: number,        // Response status code
  message: string,           // Error message
  stack: string,             // Stack trace
  userId?: string            // Authenticated user ID (if available)
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Error catching prevents crashes

*For any* error thrown in a route handler or middleware, the error handler should catch it and return a proper HTTP response without crashing the application.

**Validates: Requirements 1.1**

### Property 2: Error responses contain required fields

*For any* error caught by the error handler, the response should be valid JSON containing statusCode, message, and requestId fields.

**Validates: Requirements 1.2**

### Property 3: Error type determines status code

*For any* error with a statusCode property set to a specific value (400, 401, 403, 404), the error handler should return that status code, and for any error without a statusCode property, it should return 500.

**Validates: Requirements 1.5, 1.6, 1.7, 1.8, 1.9**

### Property 4: Stack traces in development only

*For any* error caught in development mode, the response should include a stack trace, and for any error caught in production mode, the response should not include a stack trace.

**Validates: Requirements 1.3, 1.4**

### Property 5: Validation errors include details

*For any* error with an `errors` array property, the error response should include the errors array in the response body.

**Validates: Requirements 1.5**

### Property 6: All errors are logged

*For any* error caught by the error handler, an error log entry should be created containing timestamp, requestId, method, path, statusCode, message, and stack trace.

**Validates: Requirements 1.10**

### Property 7: Async errors are caught

*For any* async route handler wrapped with asyncHandler that throws an error or returns a rejected promise, the error should be caught and passed to the error handler.

**Validates: Requirements 1.11**

## Error Handling

### Error Categories

**Operational Errors** (Expected, handled gracefully):
- Validation errors (invalid input data) - statusCode 400
- Authentication errors (missing/invalid token) - statusCode 401
- Authorization errors (insufficient permissions) - statusCode 403
- Not found errors (resource doesn't exist) - statusCode 404
- Database connection errors
- External API errors

**Programming Errors** (Unexpected, indicate bugs):
- Reference errors (undefined variables)
- Type errors (calling non-function)
- Syntax errors
- Logic errors
- Null pointer exceptions

### Error Handling Strategy

1. **Operational Errors**:
   - Create error objects with `statusCode` property
   - Return specific status codes and helpful messages
   - Include additional context (validation errors, field names)
   - Log at INFO or WARN level

2. **Programming Errors**:
   - Catch with generic error handler
   - Return 500 status code
   - Use generic message in production ("Internal server error")
   - Log at ERROR level with full stack trace
   - Consider alerting/monitoring for these errors

3. **Async Error Handling**:
   - Wrap all async route handlers with `asyncHandler`
   - Catches promise rejections automatically
   - No need for try-catch in route handlers
   - Errors flow to centralized error handler

4. **Error Logging**:
   - Log all errors with full context
   - Include request details for debugging
   - Include user information if available
   - Use structured logging format
   - Consider log aggregation service in production

### Error Response Examples

**Validation Error:**
```javascript
{
  status: 'error',
  statusCode: 400,
  message: 'Validation failed',
  requestId: 'req-123-456',
  errors: [
    { field: 'email', message: 'Invalid email format', value: 'notanemail' },
    { field: 'password', message: 'Password must be at least 8 characters' }
  ]
}
```

**Authentication Error:**
```javascript
{
  status: 'error',
  statusCode: 401,
  message: 'Invalid or expired token',
  requestId: 'req-123-456'
}
```

**Not Found Error:**
```javascript
{
  status: 'error',
  statusCode: 404,
  message: 'User not found',
  requestId: 'req-123-456'
}
```

**Internal Server Error (Production):**
```javascript
{
  status: 'error',
  statusCode: 500,
  message: 'Internal server error',
  requestId: 'req-123-456'
}
```

**Internal Server Error (Development):**
```javascript
{
  status: 'error',
  statusCode: 500,
  message: 'Cannot read property "id" of undefined',
  requestId: 'req-123-456',
  stack: 'TypeError: Cannot read property "id" of undefined\n    at ...'
}
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing

We will use **fast-check** (for JavaScript/TypeScript) as the property-based testing library. Each property test will:

- Run a minimum of 100 iterations with randomized inputs
- Reference the design document property it validates
- Use the tag format: **Feature: express-middleware, Property {number}: {property_text}**

Example property test structure:

```javascript
// Feature: express-middleware, Property 1: Error catching prevents crashes
import fc from 'fast-check';
import request from 'supertest';
import express from 'express';
import { errorHandler } from '../middleware/errorHandler.js';

test('error handler catches all errors without crashing', () => {
  fc.assert(
    fc.property(
      fc.string(), // Random error message
      fc.integer({ min: 400, max: 599 }), // Random status code
      (message, statusCode) => {
        const app = express();
        
        // Route that throws error
        app.get('/test', (req, res, next) => {
          const error = new Error(message);
          error.statusCode = statusCode;
          next(error);
        });
        
        app.use(errorHandler);
        
        return request(app)
          .get('/test')
          .expect('Content-Type', /json/)
          .then(response => {
            expect(response.status).toBe(statusCode);
            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body).toHaveProperty('message');
          });
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing

Unit tests should focus on:

- **Specific error types**: Test errors with different statusCode values (400, 401, 403, 404, 500)
- **Environment modes**: Test development vs production behavior
- **Edge cases**: Errors without statusCode, errors without message, null/undefined errors
- **Integration**: Test with actual route handlers and middleware
- **Async handling**: Test asyncHandler wrapper with various async scenarios

Example unit tests:

```javascript
describe('Error Handler', () => {
  test('returns 400 for error with statusCode 400', async () => {
    const app = express();
    app.get('/test', (req, res, next) => {
      const error = new Error('Invalid input');
      error.statusCode = 400;
      error.errors = [{ field: 'email', message: 'Required' }];
      next(error);
    });
    app.use(errorHandler);
    
    const response = await request(app).get('/test');
    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveLength(1);
  });
  
  test('includes stack trace in development', async () => {
    process.env.NODE_ENV = 'development';
    const app = express();
    app.get('/test', (req, res, next) => {
      next(new Error('Test error'));
    });
    app.use(errorHandler);
    
    const response = await request(app).get('/test');
    expect(response.body).toHaveProperty('stack');
  });
  
  test('excludes stack trace in production', async () => {
    process.env.NODE_ENV = 'production';
    const app = express();
    app.get('/test', (req, res, next) => {
      next(new Error('Test error'));
    });
    app.use(errorHandler);
    
    const response = await request(app).get('/test');
    expect(response.body).not.toHaveProperty('stack');
  });
});
```

### Test Organization

```
tests/
├── unit/
│   ├── errorHandler.test.js
│   ├── asyncHandler.test.js
│   └── integration.test.js
└── properties/
    └── errorHandler.properties.test.js
```

### Testing Tools

- **Test Framework**: Jest
- **Property Testing**: fast-check
- **HTTP Testing**: supertest
- **Assertions**: jest expect

### Coverage Goals

- Minimum 90% code coverage for error handler
- 100% coverage of error handling paths
- All 7 correctness properties implemented as property tests
- All error types covered by unit tests
- Both development and production modes tested
