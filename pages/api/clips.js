// pages/api/clips.js
import { connectToDatabase } from '../../lib/mongodb';
import Clip from '../../models/Clip';

export default async function handler(req, res) {
    try {
        await connectToDatabase();
        const clips = await Clip.find({})
            .sort({ createdAt: -1 })        // newest first
            .limit(1000)                    // safety cap
            .lean();
        res.status(200).json(clips);
    } catch (err) {
        console.error('clips api error', err);
        res.status(500).json({ error: 'server error' });
    }
}
