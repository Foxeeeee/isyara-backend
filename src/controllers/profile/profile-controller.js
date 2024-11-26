import {
  getProfile,
  updateBio,
  uploadPicture,
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

  uploadFile: async (req, res, next) => {
    try {
      const { id } = req.user;
      const file = fileSchema.parse(req.file);
      const result = await uploadPicture({ id, file });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  updateBio: async (req, res, next) => {
    try {
      const { id } = req.user;
      const { bio } = req.body;
      const result = await updateBio({ id, bio });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
