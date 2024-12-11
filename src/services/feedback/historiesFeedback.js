import { Firestore } from '@google-cloud/firestore';
import dotenv from 'dotenv';

dotenv.config();

// Inisialisasi Firestore
const firestore = new Firestore({
    projectId: process.env.FIRESTORE_PROJECT_ID,
    keyFilename: process.env.FIRESTORE_KEY_PATH,
});

// Fungsi riwayat feedback
export async function historiesFeedback() {
    const feedbackCollection = firestore.collection('feedbacks');
    const snapshot = await feedbackCollection.get();

    // Mengubah snapshot menjadi array objek
    const histories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));

    return histories;
}
