import e from 'express';
import db from '../config/db.js';
import { validateAnswer } from '../utils/validate.js';

export const answerQuestion = async (req, res) => {
    const validationResult = validateAnswer(req.body);
    if (!validationResult.valid) {
        return res.status(400).json({ message: validationResult.message });
    }
    const { description  } = req.body;
    const { questionId } = req.params;
    const userId = req.user.id; // Assuming you have user authentication and the user ID is available in req.user.id
    try {
        if (!description) { 
            return res.status(400).json({ message: 'Description is required' });
        }
        await db.query('INSERT INTO answers (description, user_id, question_id) VALUES (?, ?, ?)', [description, userId, questionId]);
        res.status(201).json({ message: 'Answer created successfully' });
    } catch (error) {
        console.error('Error creating answer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAnswersByQuestionId = async (req, res) => {
    const { questionId } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM answers WHERE question_id = ?', [questionId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching answers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }   
};

export const getAnswerById = async (req, res) => {
    const { id } = req.params;  
    try {
        const [rows] = await db.query('SELECT * FROM answers WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Answer not found' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching answer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }   
};

export const getAllAnswers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM answers'); 
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching answers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};  
