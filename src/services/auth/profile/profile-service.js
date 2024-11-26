import { prisma } from "../../../application/database.js";
import { HttpException } from "../../../middleware/error.js";
import { request } from "express";
import { uploadFile } from "../../../utilities/gcs/gcs.js";

export const getProfile = async (request) => {
  const profile = await prisma.profile.findUnique({
    where: {
      userId: request.id,
    },
  });
  if (!profile) {
    throw new HttpException(404, "User not found");
  }

  return {
    data: profile,
  };
};

export const uploadPicture = async (request) => {
  if (!request.file) {
    throw new HttpException(400, "No file provided for upload");
  }
  const fileUrl = await uploadFile(request.file);

  if (!fileUrl) {
    throw new HttpException(500, "Failed to upload file to cloud storage");
  }

  await prisma.profile.update({
    where: {
      userId: request.id,
    },
    data: {
      picture: fileUrl,
    },
  });

  return {
    message: "Upload file successfully",
    fileUrl,
  };
};

export const updateBio = async (request) => {
  await prisma.profile.update({
    where: {
      userId: request.id,
    },
    data: {
      bio: request.bio,
    },
  });
  return {
    message: "Bio updated successfully",
  };
};
