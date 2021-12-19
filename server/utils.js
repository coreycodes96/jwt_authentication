import jwt from "jsonwebtoken";
import util from "util";

export const verify = util.promisify(jwt.verify);

export const createAccessToken = (data) => {
  const secret = process.env.ACCESS_TOKEN_SECRET;

  return jwt.sign(data, secret, { expiresIn: "10s" });
};

export const createRefreshToken = (data) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;

  return jwt.sign(data, secret, { expiresIn: "1y" });
};

export const protectMiddleware = async (req, res, next) => {
  const user = res.locals.user;
  if (!user) return res.status(401).send("Unauthorized");

  next();
};

//middleware
export const deserializeMiddleware = async (req, res, next) => {
  const accessToken = req.headers["authorization"]?.split(" ")[1];
  const refreshToken = req.headers["x-refresh"]?.split(" ")[1];

  if (!accessToken) return next();

  try {
    const decoded = await verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    res.locals.user = decoded;
  } catch (error) {
    if (error.message === "jwt expired" && refreshToken) {
      const user = await verify(refreshToken, process.env.REFRESH_TOKEN_SECRET).catch(() =>
        res.status(401).send("Cannot refresh token")
      );

      const accessToken = createAccessToken({ username: user.username });

      res.setHeader("x-access", accessToken);

      res.locals.user = user;

      console.log("*********REFRESHED ACCESS TOKEN**********");

      return next();
    }
  }

  next();
};
