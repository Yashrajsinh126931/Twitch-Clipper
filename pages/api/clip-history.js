// pages/api/clip-history.js
import { connectToDatabase } from '../../lib/mongodb';
import Clip from '../../models/Clip';

export default async function handler(req, res) {
    const { name } = req.query;

    if (!name) return res.status(400).json({ error: 'Missing streamer name' });

    try {
        await connectToDatabase();
        const clips = await Clip.find({ streamerName: name }).sort({ createdAt: -1 }).limit(20);
        res.status(200).json(clips);
    } catch (err) {
        console.error('Clip history fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch clips' });
    }
}
