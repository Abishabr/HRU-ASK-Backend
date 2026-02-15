import db from '../config/db.js';
import bcrypt from 'bcrypt';

const seedDatabase = async () => {
    try {
        console.log('Starting database seeding...');

        // Hash password for all users
        const password = 'Password123!';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert Users
        console.log('Inserting users...');
        const users = [
            ['John', 'Doe', 'john.doe@example.com', hashedPassword],
            ['Jane', 'Smith', 'jane.smith@example.com', hashedPassword],
            ['Mike', 'Johnson', 'mike.j@example.com', hashedPassword],
            ['Sarah', 'Williams', 'sarah.w@example.com', hashedPassword],
            ['David', 'Brown', 'david.b@example.com', hashedPassword]
        ];

        for (const user of users) {
            await db.query(
                'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
                user
            );
        }
        console.log('✓ Users inserted');

        // Insert Questions
        console.log('Inserting questions...');
        const questions = [
            ['How do I implement error handling in Express?', 'I am building a REST API and want to add centralized error handling. What is the best approach for catching all errors and providing consistent responses?', 1],
            ['What is the difference between async/await and promises?', 'I am confused about when to use async/await vs traditional promise chains. Can someone explain the differences and when to use each?', 2],
            ['How to secure JWT tokens in Node.js?', 'What are the best practices for storing and validating JWT tokens in a Node.js application? Should I use cookies or localStorage?', 3],
            ['Best practices for MySQL connection pooling?', 'I am using mysql2 in my Node.js app. Should I create a connection pool or use individual connections? What are the performance implications?', 1],
            ['How to handle file uploads in Express?', 'I need to implement file upload functionality in my Express API. What middleware should I use and how do I validate file types and sizes?', 4],
            ['What is middleware in Express?', 'I keep hearing about middleware but I do not fully understand what it is or how to use it. Can someone explain with examples?', 5],
            ['How to prevent SQL injection in Node.js?', 'I am writing raw SQL queries in my application. How can I protect against SQL injection attacks? Are prepared statements enough?', 2],
            ['Difference between PUT and PATCH in REST APIs?', 'When should I use PUT vs PATCH for updating resources? I have seen both used interchangeably but I think there is a difference.', 3]
        ];

        for (const question of questions) {
            await db.query(
                'INSERT INTO questions (title, description, user_id) VALUES (?, ?, ?)',
                question
            );
        }
        console.log('✓ Questions inserted');

        // Insert Answers
        console.log('Inserting answers...');
        const answers = [
            ['You should create a centralized error handler middleware that catches all errors. Use a function with four parameters (err, req, res, next) and register it as the last middleware in your Express app. This ensures all errors flow through one place.', 2, 1],
            ['Additionally, you can create an asyncHandler wrapper to catch errors from async route handlers automatically. This eliminates the need for try-catch blocks in every route.', 3, 1],
            ['Async/await is syntactic sugar over promises. It makes asynchronous code look synchronous and is easier to read. Use async/await for cleaner code, but remember it is still promises under the hood.', 1, 2],
            ['The main advantage of async/await is error handling with try-catch blocks, which is more intuitive than .catch() chains. However, for parallel operations, Promise.all() is often clearer.', 4, 2],
            ['Store JWT tokens in httpOnly cookies to prevent XSS attacks. Always use HTTPS, set short expiration times, and validate tokens on every protected route. Never store sensitive data in the token payload.', 5, 3],
            ['Also implement token refresh mechanisms and consider using a blacklist for revoked tokens. Store the secret key in environment variables, never hardcode it.', 1, 3],
            ['Use connection pooling! It reuses existing connections instead of creating new ones for each query, which significantly improves performance. The mysql2 library has built-in pool support.', 2, 4],
            ['Use multer middleware for file uploads. It handles multipart/form-data and provides options for file size limits, file type validation, and storage configuration.', 3, 5],
            ['Middleware are functions that execute during the request-response cycle. They have access to req, res, and next. Common uses include authentication, logging, parsing request bodies, and error handling.', 1, 6],
            ['Always use parameterized queries or prepared statements. Never concatenate user input directly into SQL strings. The mysql2 library automatically escapes values when you use the ? placeholder syntax.', 4, 7],
            ['PUT replaces the entire resource, while PATCH partially updates it. Use PUT when sending the complete updated object, and PATCH when sending only the fields that changed.', 5, 8]
        ];

        for (const answer of answers) {
            await db.query(
                'INSERT INTO answers (description, user_id, question_id) VALUES (?, ?, ?)',
                answer
            );
        }
        console.log('✓ Answers inserted');

        console.log('\n✓ Database seeding completed successfully!');
        console.log('\nTest credentials:');
        console.log('Email: john.doe@example.com');
        console.log('Password: Password123!');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
