import express from "express";
import { createQuestion, getAllQuestions, getQuestionById } from "../controller/questionController.js";
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/questions', getAllQuestions);
router.get('/questions/:id', getQuestionById);
router.post('/questions', authenticateToken, createQuestion);

export default router;
