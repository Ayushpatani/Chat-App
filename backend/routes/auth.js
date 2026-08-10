const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const userModels = require('../models/userModels');
const fetchuser = require("../middleware/fetch");

const JWT_SECRET = process.env.JWT_SECRET || "prashant";

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Serve uploads as static files (add this in server.js/app.js)
const app = express();
// app.use('/uploads', express.static(uploadDir)); // Make sure to add in main server file

// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

/* ROUTE 1: Create a user */
router.post(
    '/createuser',
    upload.single('pic'),
    [
        body('name', 'Name must be at least 6 characters').isLength({ min: 6 }),
        body('email', 'Enter a valid Email').isEmail(),
        body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }

        try {
            const { name, email, password } = req.body;
            const pic = req.file ? `http://localhost:8000/uploads/${req.file.filename}` : null;

            console.log("hollo", pic)

            let user = await userModels.findOne({ email });
            if (user) {
                return res.status(400).json({ success, error: "User with this email already exists." });
            }

            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(password, salt);

            user = await userModels.create({
                name,
                email,
                password: secPass,
                pic
            });

            const data = { user: { id: user.id } };
            const authtoken = jwt.sign(data, JWT_SECRET);

            success = true;
            res.json({ success, authtoken, user });

        } catch (error) {
            console.error("Error in createuser route:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }
);

/* ROUTE 2: Login user */
router.post('/login', [
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password is required').exists(),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await userModels.findOne({ email });
        if (!user) {
            return res.status(400).json({ success, error: "Invalid credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, error: "Invalid credentials" });
        }

        const data = { user: { id: user.id } };
        const authtoken = jwt.sign(data, JWT_SECRET);

        success = true;
        res.json({ success, authtoken });

    } catch (error) {
        console.error("Error in login route:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

/* ROUTE 3: Get user details */
router.get('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModels.findById(userId).select("-password");
        res.json(user); // always return JSON
    } catch (error) {
        console.error("Error in getuser route:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

router.get("/getalluser", async (req, res) => {
    try {
        const users = await userModels.find().select("name _id");
        // keeps only name and _id
        res.json(users);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});


module.exports = router;
