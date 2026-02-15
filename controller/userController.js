import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {validateRegister, validateLogin} from '../utils/validate.js'



export const registerUser = async (req, res, next) => {
    try {
        const validationResult = validateRegister(req.body);
        if (!validationResult.valid) {
            const error = new Error(validationResult.message);
            error.statusCode = 400;
            return next(error);
        }
        const { firstName, lastName, email, password, confirmPassword } = req.body;
        
        // Check if user already exists
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            return next(error);
        }

        if (password !== confirmPassword) {
            const error = new Error('Passwords do not match');
            error.statusCode = 400;
            return next(error);
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user
        const [result] = await db.query('INSERT INTO users (first_name, last_name, password, email) VALUES (?, ?, ?, ?)', [firstName, lastName, hashedPassword, email]);
        // fetch created user (omit password)
        const [userRows] = await db.query('SELECT user_id, first_name, last_name, email FROM users WHERE email = ?', [email]);
        const user = userRows[0];
        // sign JWT
        const token = jwt.sign({ id: user.user_id, email: user.email }, process.env.jwtSecret, { expiresIn: '1h' });
        
        res.status(201).json({ message: 'User registered successfully', token, user });
    } catch (error) { 
        next(error);
    }
};

export const loginUser = async (req, res, next) => {
    try {
        const validationResult = validateLogin(req.body);
        
        if (!validationResult.valid) {
            const error = new Error(validationResult.message);
            error.statusCode = 400;
            return next(error);
        }
        const { email, password } = req.body;
        
        // Find user by email
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            return next(error);
        }   
        // Compare password
        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            return next(error);
        }
        // sign JWT and return (omit password)
        const token = jwt.sign({ id: user.user_id, email: user.email }, process.env.jwtSecret, { expiresIn: '1h' });
        const safeUser = { user_id: user.user_id, first_name: user.first_name, last_name: user.last_name, email: user.email };
        res.status(200).json({ message: 'Login successful', token, user: safeUser });
    } catch (error) {
        next(error);
    }
};



// export const registerUser = async (req, res) => {
//     const { first_name, last_name, email, password, confirmPassword } = req.body;
//     if (!first_name || !last_name || !email || !password || !confirmPassword) {
//         return res.status(400).json({ message: 'please provide the required fields' });
//     }
//     if (password !== confirmPassword) {
//         return res.status(400).json({ message: 'Passwords do not match' });
//     }

//     try {
//         // Check if user already exists
//         const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
//         if (rows.length > 0) {
//             return res.status(409).json({ message: 'User already exists' });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create new user
//         await db.query('INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)', [first_name, last_name, email, hashedPassword],);

//         res.status(201).json({ message: 'User registered successfully' });
//     } catch (error) {
//         console.error('Error registering user:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };
// export const loginUser = async (req, res) => {
//     const { email, password } = req.body;
//     if (!email || !password){
//         return res.status(400).json({ message: 'please provide the required fields' });
//     }
//     try {
//         // Find user by email
//         const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
//     //    console.log(rows)
//         if (rows.length === 0) {
//             return res.status(401).json({ message: 'Invalid email or password' });
//         }
//         // Compare password
//         const user = rows[0];
//         console.log(user)
//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         // console.log(isPasswordValid)
//         if (!isPasswordValid) {
//             return res.status(401).json({ message: 'Invalid email or password' });
//         }
//         res.status(200).json({ message: 'Login successful', user: user });
//     } catch (error) {
//         console.error('Error logging in user:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };
