const mongoose = require('mongoose');

const StreamerSchema = new mongoose.Schema({
    name: String,
    game: String,
    title: String,
    viewers: Number,
    score: Number,
    timestamp: Date,
});

module.exports = mongoose.models.Streamer || mongoose.model('Streamer', StreamerSchema);
