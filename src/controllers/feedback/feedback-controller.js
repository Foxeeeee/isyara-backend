import {
  saveFeedback,
  historiesFeedback,
} from "../../services/feedback/feedback-service.js";
import { HttpException } from "../../middleware/error.js";

export const feedbackController = {
  saveFeedback: async (req, res, next) => {
    try {
      const { email, feedback } = req.body;
      const result = await saveFeedback({ email, feedback });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  historiesFeedback: async (req, res, next) => {
    try {
      const history = await historiesFeedback();
      const formatHistoreis = history.map((doc) => ({
        id: doc.id,
        history: {
          createdAt: doc.createdAt,
          email: doc.email,
          feedback: doc.feedback,
        },
      }));

      return res.status(200).json(formatHistoreis);
    } catch (error) {
      next(error);
    }
  },
};
