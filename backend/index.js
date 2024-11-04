const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config()



const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(cookieParser());
app.use(express.json());

// Route to log in and set a cookie with a token
app.post('/login', (req, res) => {
    const { username } = req.body;
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.cookie('authToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({ message: 'Logged in successfully' });
});

app.use("/loginpage",(req,res)=>{
    res.render("index")
})

function verifyToken(req, res, next) {
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

// Protected route
app.get('/protected', verifyToken, (req, res) => {
    const user =  req.user.username
    res.render("user", {user})
    res.json({ message: `Hello ${req.user.username}, you have access!` });
});

// Logout route to clear the cookie
app.post('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.json({ message: 'Logged out successfully' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
