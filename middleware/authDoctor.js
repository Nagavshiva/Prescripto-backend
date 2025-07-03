import jwt from 'jsonwebtoken';

/**
 * Doctor authentication middleware.
 * Expects:
 *   - JWT token in Authorization header as: Bearer <token>
 *   - Token payload to include: { id: doctorId, role: 'doctor', ... }
 */
const authDoctor = (req, res, next) => {
  try {
    // 1. Get token from standard Authorization header
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res
        .status(401)
        .json({ success: false, message: "Authorization token missing or invalid" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Optional: Check if role is 'doctor' if you're assigning roles
    if (decoded.role && decoded.role !== 'doctor') {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: doctor credentials required" });
    }

    // 4. Attach doctor info to request (avoid mutating req.body)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || "doctor",
    };

    next();
  } catch (error) {
    console.error("authDoctor error:", error);
    res.status(401).json({ success: false, message: "Token is invalid or expired" });
  }
};

export default authDoctor;
