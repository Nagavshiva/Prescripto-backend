import jwt from 'jsonwebtoken';

const authUser = (req, res, next) => {
  // 1. Read Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, token missing' });
  }

  // 2. Extract token
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Attach user info (avoid mutating req.body)
    req.user = { id: payload.id };
    
    // 5. Proceed
    next();
  } catch (err) {
    // 6. Handle invalid/expired token
    console.error('JWT verification failed:', err);
    return res
      .status(401)
      .json({ success: false, message: 'Token is invalid or expired' });
  }
};

export default authUser;
