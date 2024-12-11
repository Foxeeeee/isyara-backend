import { z } from "zod";
import path from "path";

export const fileValidation = z.object({
  mimetype: z.string().refine((type) => type.startsWith("image/"), {
    message: "Only image files are allowed",
  }),
  originalname: z.string().refine(
    (name) => {
      const ext = path.extname(name).toLowerCase();
      return [".jpeg", ".jpg", ".png"].includes(ext);
    },
    { message: "File extension must be .jpeg, .jpg, or .png" }
  ),
  size: z.number().max(5 * 1024 * 1024, {
    message: "File size must not exceed 5MB",
  }),
  buffer: z.instanceof(Buffer).optional(),
});
