import jwt from "jsonwebtoken";

/**
 * Admin authentication middleware.
 *
 * Expects:
 *   - process.env.JWT_SECRET to be set
 *   - process.env.ADMIN_EMAIL (and/or ADMIN_ROLE) to identify your admin
 *
 * Usage:
 *   app.use("/admin", authAdmin, adminRouter);
 */
const authAdmin = (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided, authorization denied" });
    }

    // 2. Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // payload might look like: { id: "...", email: "...", role: "admin", iat: xxx, exp: xxx }

    // 3. Check admin identity
    const isAdminEmail = payload.email === process.env.ADMIN_EMAIL;
    const isAdminRole = payload.role === process.env.ADMIN_ROLE || payload.role === "admin";

    if (!isAdminEmail && !isAdminRole) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: admin credentials required" });
    }

    // 4. Attach user info to request
    req.user = payload;

    // 5. Forward to next middleware/route handler
    next();
  } catch (err) {
    console.error("authAdmin error:", err);
    // Token expired or invalid
    return res
      .status(401)
      .json({ success: false, message: "Token is invalid or expired" });
  }
};

export default authAdmin;
