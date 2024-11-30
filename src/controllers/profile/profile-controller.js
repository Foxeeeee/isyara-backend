import {
  getProfile,
  editProfile,
} from "../../services/auth/profile/profile-service.js";
import { fileSchema } from "../../schemas/auth/profile/profile-schema.js";
import { HttpException } from "../../middleware/error.js";

export const profileController = {
  getProfile: async (req, res, next) => {
    try {
      const { id } = req.user;
      const result = await getProfile({ id });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  editProfile: async (req, res, next) => {
    try {
      const { id, bio, fullname } = req.user;
      const file = fileSchema.parse(req.file);
      const result = await editProfile({ id, fullname, bio, file });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
