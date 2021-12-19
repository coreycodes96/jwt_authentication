import express from 'express';
import {} from 'dotenv/config';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();

app.use(express.json());
app.use(express.urlencoded({limit: '30mb', extended: true}));
app.use(cors());

//variables
let refreshTokens = [];

let posts = [
    {
        id: 1,
        username: "Username 1",
        post: "This is a post created by Username 1"
    },
    {
        id: 2,
        username: "Username 2",
        post: "This is a post created by Username 2"
    }
];

//middleware
const verifyToken = (req, res, next) => {
    const headers = req.headers['authorization'];
    const token = headers.split(' ')[1];

    if(token === null) return res.status(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if(error) return res.status(403);

        res.locals.user = user;
    });

    next();
};

//login route
app.post('/login', (req, res) => {
    const {username} = req.body;

    const accessToken = generateAccessToken({username});
    const refreshToken = jwt.sign({username}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1y'});

    refreshTokens.push(refreshToken);

    return res.status(200).json({accessToken, refreshToken});
});

//posts route
app.get('/posts', verifyToken, (req, res) => {
    const {username} = res.locals.user;

    const foundPost = posts.filter(post => post.username === username);

    return res.status(200).json(foundPost);
});

//refresh access token route
app.post('/refresh', verifyToken, (req, res) => {
     const {refreshToken} = req.body;
 
     if(refreshToken === null) return res.status(401);
     if(!refreshTokens.includes(refreshToken)) return res.status(403);
 
     jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
         if(error) return res.status(403);
 
         const newAccessToken = generateAccessToken({username: user.username});
 
         return res.status(200).json({newAccessToken});
     });
 
 });

//methods
const generateAccessToken = data => {
    return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '5s'});
}

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`You are connected to port ${port}`);
});