import { Firestore } from '@google-cloud/firestore';
import dotenv from 'dotenv';

dotenv.config();

// Inisialisasi Firestore
const firestore = new Firestore({
    projectId: process.env.FIRESTORE_PROJECT_ID,
    keyFilename: process.env.FIRESTORE_KEY_PATH,
});

// Fungsi menyimpan feedback
export const saveFeedback = async ({ email, feedback }) => {
    const feedbackRef = firestore.collection('feedbacks').doc();
    const createdAt = new Date().toISOString();
    await feedbackRef.set({ email, feedback, createdAt });
};
