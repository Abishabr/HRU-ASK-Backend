import db from '../config/db.js';
import { validateQuestion } from '../utils/validate.js';

export const getAllQuestions = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM questions');
        res.status(200).json({ message: 'Questions fetched successfully', data: rows });
    } catch (error) {
        next(error);
    }
};


export const getQuestionById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM questions WHERE id = ?', [id]);
        if (rows.length === 0) {
            const error = new Error('Question not found');
            error.statusCode = 404;
            return next(error);
        }
        res.status(200).json({ message: 'Question fetched successfully', data: rows[0] });
    } catch (error) {
        next(error);
    }   
};

export const createQuestion = async (req, res, next) => {
    try {
        const validationResult = validateQuestion(req.body);
        if (!validationResult.valid) {
            const error = new Error(validationResult.message);
            error.statusCode = 400;
            return next(error);
        }
        const { title, description } = req.body;
        const userId = req.user && req.user.id;
        if (!userId) {
            const error = new Error('Authentication required');
            error.statusCode = 401;
            return next(error);
        }
        const [result] = await db.query('INSERT INTO questions (title, description, user_id) VALUES (?, ?, ?)', [title, description, userId]);
        res.status(201).json({ message: 'Question created successfully', data: { id: result.insertId } });
    } catch (error) {
        next(error);
    }
};


