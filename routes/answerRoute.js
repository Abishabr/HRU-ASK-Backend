import express from "express";
import { answerQuestion, getAllAnswers, getAnswerById, getAnswersByQuestionId } from "../controller/answerQuestion.js";
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/answers', getAllAnswers);
router.get('/answers/:id', getAnswerById);
router.get('/questions/:questionId/answers', getAnswersByQuestionId);
router.post('/questions/:questionId/answers', authenticateToken, answerQuestion);

export default router;
// router.put('/answers/:id', updateAnswer);
// router.delete('/answers/:id', deleteAnswer);