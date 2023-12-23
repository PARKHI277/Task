const jwt = require("jsonwebtoken");

const isUserAuthorized = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return res.status(401).send("Unauthorized: Missing Headers");
  const jwtToken = authHeader.replace("Bearer ", "");
  jwt.verify(jwtToken, "process.env.Secret_Key", (err, decoded) => {
    if (err) {
      console.log("err: ", err);
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded;

    next();
  });
};

module.exports = { isUserAuthorized };
