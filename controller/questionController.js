import db from '../config/db.js';
import { validateQuestion } from '../utils/validate.js';

export const getAllQuestions = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM questions');
        res.status(200).json({ message: 'Questions fetched successfully', data: rows });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const getQuestionById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM questions WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json({ message: 'Question fetched successfully', data: rows[0] });
    } catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }   
};

export const createQuestion = async (req, res) => {

    const validationResult = validateQuestion(req.body);
   
    try {
        if (!validationResult.valid) {
            return res.status(400).json({ message: validationResult.message });
        }
        const { title, description } = req.body;
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ message: 'Authentication required' });
        const [result] = await db.query('INSERT INTO questions (title, description, user_id) VALUES (?, ?, ?)', [title, description, userId]);
        res.status(201).json({ message: 'Question created successfully', data: { id: result.insertId } });
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


