import mongoose from 'mongoose';

const ClipSchema = new mongoose.Schema({
    clipId: String,
    url: String,
    streamerName: String,
    streamerId: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Clip || mongoose.model('Clip', ClipSchema);
