// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error("Token verification failed:", err);
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.userId = user.userId;
        next();
    });
};

module.exports = authenticateToken;
