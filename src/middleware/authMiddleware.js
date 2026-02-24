const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Get the token from the header
    const tokenHeader = req.header('Authorization');

    // 2. Check if token exists
    if (!tokenHeader) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access Denied: No Token Provided!' 
        });
    }

    try {
        // 3. Smart Token Extraction
        // If it starts with "Bearer ", remove it. If not, just use the token.
        const token = tokenHeader.startsWith("Bearer ") 
            ? tokenHeader.slice(7, tokenHeader.length).trimLeft() 
            : tokenHeader;

        // 4. Verify the token
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_fallback');
        
        // 5. Add user to request
        req.user = verified;
        next(); // pass to the next middleware

    } catch (err) {
        res.status(400).json({ 
            success: false, 
            message: 'Invalid Token' 
        });
    }
};
// 2. ROLE-BASED ACCESS CONTROL (The missing function!)
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Access denied. Role (${req.user.role}) not authorized.` 
            });
        }
        next();
    };
};

// 3. EXPORT BOTH AS AN OBJECT
module.exports = {
    authMiddleware,
    authorizeRoles
};