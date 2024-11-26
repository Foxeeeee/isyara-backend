import { HttpException } from "../error.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

export const authMiddleware = {
  authHandler: (req, res, next) => {
    try {
      const token = req.headers.authorization?.substring(7);
      if (!token) {
        throw new Error(401, "Unauthorized");
      }
      jwt.verify(token, process.env.JWT_KEY, (err, user) => {
        if (err) {
          throw new Error(401, "Unauthorized");
        }

        req.user = user;
        next();
      });
    } catch (err) {}
  },

  passHandler: (req, res, next) => {
    try {
      const token = req.params.token;
      if (!token) {
        throw new Error(401, "Unauthorized");
      }
      jwt.verify(token, process.env.JWT_KEY, (err, user) => {
        if (err) {
          throw new Error(401, "Unauthorized");
        }
        req.user = user;
        next();
      });
    } catch (error) {}
  },
};
