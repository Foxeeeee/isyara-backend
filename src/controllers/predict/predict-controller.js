import axios from "axios";
import "dotenv/config";
import { HttpException } from "../../middleware/error.js";

export const proxy = async (req, res, next) => {
  try {
    const flaskResponse = await axios.post(process.env.FLASK_SERVER, req.body, {
      headers: { "Content-Type": "application/json" },
    });
    res.status(200).json(flaskResponse.data);
  } catch (error) {
    next(error);
  }
};
