import { saveFeedback } from '../../services/feedback/firestoreService.js';
import { historiesFeedback as getHistoriesData } from '../../services/feedback/historiesFeedback.js';

// Handler untuk menyimpan feedback
export const handleFeedback = async (req, res) => {
    const { email, feedback } = req.body;

    // Validasi input
    if (!email || !feedback) {
        return res.status(400).json({ error: 'Email dan feedback wajib diisi' });
    }

    try {
        await saveFeedback({ email, feedback });
        return res.status(201).json({ message: 'Feedback berhasil disimpan!' });
    } catch (error) {
        console.error('Error menyimpan feedback:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan feedback.' });
    }
};

// Handler untuk mendapatkan riwayat feedback
export const historiesFeedback = async (req, res) => {
    try {
        const historyData = await getHistoriesData();

        // Format data untuk respons
        const formatData = historyData.map((doc) => ({
            id: doc.id,
            history: {
                createdAt: doc.createdAt,
                email: doc.email,
                feedback: doc.feedback,
            },
        }));

        return res.status(200).json({
            status: 'success',
            data: formatData,
        });
    } catch (error) {
        console.error('Error mengambil feedback histories:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil riwayat feedback.',
        });
    }
};
