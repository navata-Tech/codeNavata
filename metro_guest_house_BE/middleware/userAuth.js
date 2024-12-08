const jwt = require("jsonwebtoken");
module.exports.isAuthenticated = (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;

    if (typeof bearerToken !== "undefined") {
      const token = bearerToken.split(" ")[1];
      jwt.verify(token, process.env.SECRET, (err, authData) => {
        if (err) {
          return res.status(403).json({
            success: false,
            message: "Access denied",
          });
        } else {
          req.headers.authData = authData;
          next(); // No need for setTimeout
        }
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Token not provided",
      });
    }
  } catch (error) {
    console.log("Error FOUND:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports.isAdmin = async (req, res, next) => {
  try {
    if (req.headers.authData.role == "admin") {
      next();
    } else {
      res.json({
        success: false,
        message: "access denied",
      });
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(403).json({
      message: "something went wrong",
    });
  }
};
