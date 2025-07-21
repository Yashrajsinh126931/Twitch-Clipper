// pages/api/streamer-history.js
import { connectToDatabase } from '../../lib/mongodb';
import Streamer from '../../models/Streamer';

export default async function handler(req, res) {
    const { name } = req.query;
    await connectToDatabase();

    const history = await Streamer.find({ name }).sort({ timestamp: 1 });

    const chartData = history.map((entry) => ({
        x: entry.timestamp,
        y: entry.viewers ?? entry.viewer_count ?? entry.viewerCount ?? 0,
    }));

    res.status(200).json(chartData);
}
