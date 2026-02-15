import db from '../config/db.js';
import bcrypt from 'bcrypt';
import {validateRegister, validateLogin} from '../utils/validate.js'



export const registerUser = async (req, res) => {
    const validationResult = validateRegister(req.body);
    if (!validationResult.valid) {
        return res.status(400).json({ message: validationResult.message });
    }
    const { firstName, lastName, email, password } = req.body;
    try {
        // Check if user already exists
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user
        await db.query('INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)', [firstName, lastName, email, hashedPassword],);
        res.status(201).json({ message: 'User registered successfully' });
    }

        catch (error) { 
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const loginUser = async (req, res) => {
    const validationResult = validateLogin(req.body);
    if (!validationResult.valid) {
        return res.status(400).json({ message: validationResult.message });
    }
    const { email, password } = req.body;
    try {
        // Find user by email

        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {

            return res.status(401).json({ message: 'Invalid email or password' });
        }   
        // Compare password
        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        res.status(200).json({ message: 'Login successful', user: user });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
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
