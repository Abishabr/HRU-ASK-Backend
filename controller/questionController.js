import db from '../config/db.js';

export const getAllQuestions = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM questions');
        res.status(200).json(rows);
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
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }   
};

export const createQuestion = async (req, res) => {
    const { title, content, userId } = req.body;
    try {
        await db.query('INSERT INTO questions (title, content, user_id) VALUES (?, ?, ?)', [title, content, userId]);
        res.status(201).json({ message: 'Question created successfully' });
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


