import express from "express";
import env from "dotenv";
env.config();
import cors from "cors";
import { deserializeMiddleware, createAccessToken, createRefreshToken, protectMiddleware } from "./utils.js";
import morgan from "morgan";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ limit: "30mb", extended: true }));

/**
 * We are exposing some response headers to
 * the client so we can use it to update
 * our tokens after requests
 */
app.use(
  cors({
    exposedHeaders: ["x-access", "x-refresh"],
  })
);

app.use(morgan("dev"));

app.use(deserializeMiddleware);

//variables
let refreshTokens = [];

let posts = [
  {
    id: 1,
    username: "Username 1",
    post: "This is a post created by Username 1",
  },
  {
    id: 2,
    username: "Username 2",
    post: "This is a post created by Username 2",
  },
];

//login route
app.post("/login", (req, res) => {
  const { username } = req.body;

  const accessToken = createAccessToken({ username });
  const refreshToken = createRefreshToken({ username });

  refreshTokens.push(refreshToken);

  return res.status(200).json({ accessToken, refreshToken });
});

//posts route
app.get("/posts", protectMiddleware, (req, res) => {
  const { username } = res.locals.user;

  const foundPost = posts.filter((post) => post.username === username);

  return res.status(200).json(foundPost);
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log("Server started at " + port));
