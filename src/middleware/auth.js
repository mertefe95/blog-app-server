const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    try {
    const token = req.header("x-auth-token");
    if (!token)
    return res.status(401).json({ error: "No authentication token, authorization denied. "});

    const verified = jwt.verify(token, "b7f438b7735800f267494e0b008f8406f84ad9bb72cf7ec687baa5b669427cb0212e8fe5f00bcb5c146c5404a4593ee6");
    if (!verified) return res
        .status(401)
        .json({ error: "No authentication token, authorization denied. "});

    req.user = verified.id;
    next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = auth