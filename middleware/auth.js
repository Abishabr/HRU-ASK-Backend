import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[0] === 'Bearer' ? authHeader.split(' ')[1] : null;
    
    if (!token) {
        const error = new Error('Access token required');
        error.statusCode = 401;
        return next(error);
    }
    
    const secret = process.env.jwtSecret;
    try {
        const payload = jwt.verify(token, secret);
        req.user = payload;
        next();
    } catch (err) {
        err.statusCode = 401;
        err.message = 'Invalid or expired token';
        return next(err);
    }
};

export default authenticateToken;
