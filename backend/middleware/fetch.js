const jwt = require('jsonwebtoken');
const JWT_SECRETE = "prashant";

const fetchuser = (req, res, next) => {

    //GER the user form jwt token and add id to req object
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ error: "Pleasse authenticate using valid token. " });
    }
    try {
        const data = jwt.verify(token, JWT_SECRETE);
        req.user = data.user;
        console.log(data);

        next();

    } catch (error) {
        res.status(401).send({ error: "Pleasse authenticate using valid token. " });
    }
}

module.exports = fetchuser;