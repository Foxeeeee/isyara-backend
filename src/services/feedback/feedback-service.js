import { HttpException } from "../../middleware/error.js";
import { firestore } from "../../utilities/firestore/firestore.js";

export const saveFeedback = async (request) => {
  const email = request.email;
  const feedback = request.feedback;

  if (!email && !feedback) {
    throw new HttpException(400, "Email and feedback must be filled in");
  }
  const feedbackRef = firestore.collection("feedbacks").doc();
  const createdAt = new Date().toISOString();
  await feedbackRef.set({ email, feedback, createdAt });

  return {
    message: "Sent feedback succesfully",
  };
};

export const historiesFeedback = async () => {
  const feedbackCollection = firestore.collection("feedbacks");
  const snapshot = await feedbackCollection.get();

  if (!feedbackCollection || !snapshot) {
    throw new HttpException(400, "Failed get feedback");
  }

  const histories = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    message: "success",
    data: histories,
  };
};
