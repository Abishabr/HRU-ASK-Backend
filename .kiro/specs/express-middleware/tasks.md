# Implementation Plan: Express Error Handler Middleware

## Overview

This plan implements centralized error handling middleware for the Express.js application. The implementation will create an error handler that catches all errors, provides consistent JSON responses, supports environment-specific behavior (development vs production), and integrates with existing authentication middleware. The approach uses functional programming without custom error classes.

## Tasks

- [ ] 1. Create error handler middleware
  - [ ] 1.1 Implement errorHandler middleware function
    - Create middleware/errorHandler.js file
    - Implement error handler with four parameters (err, req, res, next)
    - Extract status code from err.statusCode or err.status, default to 500
    - Format error response with status, statusCode, message, and requestId
    - Include err.errors array in response if present (for validation errors)
    - Add stack trace to response only when NODE_ENV !== 'production'
    - Use generic "Internal server error" message for 500 errors in production
    - Log error with timestamp, requestId, method, path, statusCode, message, stack, and userId
    - Send JSON response and do not call next()
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

  - [ ]* 1.2 Write property test for error catching
    - **Property 1: Error catching prevents crashes**
    - **Validates: Requirements 1.1**
    - Test that any error thrown in a route handler is caught and returns a response
    - Use fast-check to generate random errors with various properties
    - Verify application doesn't crash and returns proper HTTP response

  - [ ]* 1.3 Write property test for error response structure
    - **Property 2: Error responses contain required fields**
    - **Validates: Requirements 1.2**
    - Test that any error produces a response with statusCode, message, and requestId
    - Use fast-check to generate random errors
    - Verify response is valid JSON with all required fields

  - [ ]* 1.4 Write property test for status code mapping
    - **Property 3: Error type determines status code**
    - **Validates: Requirements 1.5, 1.6, 1.7, 1.8, 1.9**
    - Test that errors with statusCode property return that code
    - Test that errors without statusCode return 500
    - Use fast-check to generate errors with various statusCode values

  - [ ]* 1.5 Write unit tests for environment-specific behavior
    - Test stack trace included in development mode
    - Test stack trace excluded in production mode
    - Test generic message for 500 errors in production
    - Test original message preserved in development
    - _Requirements: 1.3, 1.4_

  - [ ]* 1.6 Write unit tests for validation errors
    - Test that errors with errors array include it in response
    - Test 400 status code for validation errors
    - _Requirements: 1.5_

- [ ] 2. Create async handler wrapper
  - [ ] 2.1 Implement asyncHandler utility
    - Create middleware/asyncHandler.js file
    - Export asyncHandler function that takes a function parameter
    - Return middleware function (req, res, next) => {}
    - Wrap fn call in Promise.resolve().catch(next)
    - _Requirements: 1.11_

  - [ ]* 2.2 Write property test for async error catching
    - **Property 7: Async errors are caught**
    - **Validates: Requirements 1.11**
    - Test that async handlers wrapped with asyncHandler catch errors
    - Test that rejected promises are caught
    - Use fast-check to generate random async errors

  - [ ]* 2.3 Write unit tests for asyncHandler
    - Test successful async handler execution
    - Test async handler with thrown error
    - Test async handler with rejected promise
    - Test that errors are passed to next()
    - _Requirements: 1.11_

- [ ] 3. Update existing authentication middleware
  - [ ] 3.1 Modify auth.js to use error handler
    - Update authenticateToken to create error objects with statusCode property
    - Replace res.status().json() calls with next(error) calls
    - Set error.statusCode = 401 for authentication errors
    - Maintain existing authentication logic
    - _Requirements: 1.6_

  - [ ]* 3.2 Write integration tests for auth middleware
    - Test missing token returns 401 via error handler
    - Test invalid token returns 401 via error handler
    - Test valid token proceeds to route handler
    - Test error response format matches error handler format
    - _Requirements: 1.6_

- [ ] 4. Integrate error handler into app.js
  - [ ] 4.1 Add error handler to Express application
    - Import errorHandler from middleware/errorHandler.js
    - Add app.use(errorHandler) as the last middleware (after all routes)
    - Ensure it's registered after all route definitions
    - _Requirements: 1.12_

  - [ ]* 4.2 Write integration tests for full error flow
    - Test error in route handler flows through error handler
    - Test error in middleware flows through error handler
    - Test async error in route handler flows through error handler
    - Test authentication error flows through error handler
    - Test error handler is called for all error types
    - _Requirements: 1.1, 1.2, 1.10, 1.11, 1.12_

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The error handler uses functional programming without custom error classes
- Errors are plain Error objects with statusCode and errors properties
- The asyncHandler wrapper eliminates need for try-catch in async routes
- Integration with existing auth middleware maintains backward compatibility
