import { prisma } from "../../application/database.js";

export const deleteUnverifiedUsers = async () => {
  try {
    const result = await prisma.users.deleteMany({
      where: {
        isVerifed: false,
      },
    });
    console.log(`${result.count} users has been deleted`);
  } catch (error) {
    console.log("Failed to delete users", error);
  }
};
