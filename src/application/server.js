import express from "express";
import cors from "cors";
import { errorHandler } from "../middleware/error.js";
import { router } from "../router/index.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.use(router);

app.use(errorHandler);
