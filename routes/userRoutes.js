import express from 'express';
import {registerUser, loginUser} from '../controller/userController.js';

const router = express.Router();


// Separate routes for register and login
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;