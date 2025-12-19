const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'foodapp_secret_key_2024';
const JWT_EXPIRES_IN = '7d';

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

function getTokenFromRequest(request) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

async function getUserFromRequest(request) {
    const token = getTokenFromRequest(request);
    if (!token) return null;

    const decoded = verifyToken(token);
    return decoded;
}

function requireAuth(handler) {
    return async (request, context) => {
        const user = await getUserFromRequest(request);
        if (!user) {
            return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        request.user = user;
        return handler(request, context);
    };
}

function requireRole(...roles) {
    return (handler) => {
        return async (request, context) => {
            const user = await getUserFromRequest(request);
            if (!user) {
                return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
            }
            if (!roles.includes(user.role)) {
                return Response.json({ success: false, message: 'Forbidden' }, { status: 403 });
            }
            request.user = user;
            return handler(request, context);
        };
    };
}

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken,
    getTokenFromRequest,
    getUserFromRequest,
    requireAuth,
    requireRole
};
