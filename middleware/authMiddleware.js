import jwt from "jsonwebtoken";

export const verifyJWT = async (req, res, next) => {
  if (typeof req.headers["authorization"] === "undefined") {
    return res.status(401).send({
      error: {
        message: "Not authorized, cannot find token",
      },
    });
  } else {
    let token = req.headers["authorization"];
    let decoded = verify_jwt(token);
    if (decoded.status) {
      req.auth = decoded.data;
      next();
    } else {
      return res.status(401).send({
        error: {
          message: "Unauthorized access",
        },
      });
    }
  }
};

export const verifyAdmin = async (req, res, next) => {
  try {
    const requester = req.auth.id;
    const requesterAccount = await User.findOne({
      $or: [{ userId: requester }, { email: requester }],
    });
    if (requesterAccount?.role === "admin") {
      next();
    } else {
      return res.status(401).send({
        error: {
          message: "Not authorized, token failed",
        },
      });
    }
  } catch (e) {
    return res.status(401).send({
      error: {
        message: e.message,
      },
    });
  }
};
const authMiddleware = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default { verifyJWT, verifyAdmin, authMiddleware };

// module.exports = authMiddleware;
