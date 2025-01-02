const jwt = require("jsonwebtoken");

const autheticateToken = (req, res, next) => {
  const secretKey = process.env.SECRET_KEY;
  const token = req.header("authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "access denied. No token provided",
    });
  }

  try {
    const verified = jwt.verify(token, secretKey);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({
      message: "Invalid token",
      error,
    });
  }
};

module.exports = autheticateToken;
