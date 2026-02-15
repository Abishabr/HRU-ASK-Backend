import db from '../config/db.js';
import { validateAnswer } from '../utils/validate.js';

export const answerQuestion = async (req, res, next) => {
    try {
        const validationResult = validateAnswer(req.body);
        if (!validationResult.valid) {
            const error = new Error(validationResult.message);
            error.statusCode = 400;
            return next(error);
        }
        const { description  } = req.body;
        const { questionId } = req.params;
        const userId = req.user.id;
        
        const [result] = await db.query('INSERT INTO answers (description, user_id, question_id) VALUES (?, ?, ?)', [description, userId, questionId]);
        res.status(201).json({ message: 'Answer created successfully', data: { id: result.insertId } });
    } catch (error) {
        next(error);
    }
};

export const getAnswersByQuestionId = async (req, res, next) => {
    const { questionId } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM answers WHERE question_id = ?', [questionId]);
        res.status(200).json({ message: 'Answers fetched successfully', data: rows });
    } catch (error) {
        next(error);
    }   
};

export const getAnswerById = async (req, res, next) => {
    const { id } = req.params;  
    try {
        const [rows] = await db.query('SELECT * FROM answers WHERE id = ?', [id]);
        if (rows.length === 0) {
            const error = new Error('Answer not found');
            error.statusCode = 404;
            return next(error);
        }
        res.status(200).json({ message: 'Answer fetched successfully', data: rows[0] });
    } catch (error) {
        next(error);
    }   
};

export const getAllAnswers = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM answers'); 
        res.status(200).json({ message: 'Answers fetched successfully', data: rows });
    } catch (error) {
        next(error);
    }
};  
