import Clip from '../../models/Clip';
import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
    const { token, broadcasterId, streamerName } = req.body;

    if (!token || !broadcasterId || !streamerName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Step 1: Create clip via Twitch API
    const twitchResponse = await fetch(`https://api.twitch.tv/helix/clips?broadcaster_id=${broadcasterId}`, {
        method: 'POST',
        headers: {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${token}`,
        },
    });

    const twitchData = await twitchResponse.json();
    const clip = twitchData.data?.[0];

    if (!clip) {
        return res.status(500).json({ error: 'Failed to create clip', raw: twitchData });
    }

    const clipUrl = `https://clips.twitch.tv/${clip.id}`;

    // Step 2: Save to MongoDB
    try {
        await connectToDatabase();

        const newClip = await Clip.create({
            clipId: clip.id,
            url: clipUrl,
            streamerName,
            streamerId: broadcasterId,
        });

        // Step 3: Send Discord Webhook Notification
        await sendToDiscord({ streamerName, clipUrl });

        return res.status(200).json({ url: newClip.url, id: newClip._id });
    } catch (err) {
        console.error('❌ MongoDB error:', err);
        return res.status(500).json({ error: 'Failed to save clip to database' });
    }
}

async function sendToDiscord({ streamerName, clipUrl }) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
        console.warn("⚠️ DISCORD_WEBHOOK_URL is not set in .env");
        return;
    }

    const payload = {
        embeds: [
            {
                title: `📸 New Twitch Clip Created for ${streamerName}`,
                description: `**Streamer:** ${streamerName}\n[Watch Clip](${clipUrl})`,
                color: 0x9146ff,
                timestamp: new Date().toISOString(),
            }
        ]
    };

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        console.log("✅ Sent clip to Discord:", clipUrl);
    } catch (err) {
        console.error("❌ Failed to send Discord webhook:", err);
    }
}
