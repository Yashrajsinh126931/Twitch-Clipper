import fetch from "node-fetch";
import { parse } from "cookie";
import { connectToDatabase } from "../../lib/mongodb";
import Clip from "../../models/Clip";

const EXTERNAL_API_BASE = "https://0np5twiut4.execute-api.us-east-1.amazonaws.com/dev/api/v2/media/fetch/secure-token-xyz789";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Only GET supported" });
    }

    const { clipId } = req.query;
    if (!clipId || typeof clipId !== "string") {
        return res.status(400).json({ error: "clipId required" });
    }

    const cookies = parse(req.headers.cookie || "");
    const bearer = cookies.twitch_token;
    if (!bearer) {
        return res.status(401).json({ error: "No Twitch session" });
    }

    await connectToDatabase();

    try {
        const clip = await Clip.findOne({ clipId }).lean();
        if (!clip) return res.status(404).json({ error: "Clip not found in DB" });

        let mp4 = clip.downloadUrl;

        if (!mp4) {
            // Try external API first
            try {
                const extRes = await fetch(`${EXTERNAL_API_BASE}?id=${clipId}`);
                const extJson = await extRes.json();
                const extClip = extJson?.data?.[0];
                mp4 = extClip?.video_url || null;
            } catch (err) {
                console.warn("External API fetch failed:", err);
            }

            if (!mp4) {
                // Try Twitch API
                const twitchRes = await fetch(`https://api.twitch.tv/helix/clips?id=${clipId}`, {
                    headers: {
                        "Client-ID": process.env.TWITCH_CLIENT_ID,
                        Authorization: `Bearer ${bearer}`,
                    },
                });

                const twitchJson = await twitchRes.json();
                const meta = twitchJson.data?.[0];
                if (!meta) return res.status(404).json({ error: "Clip not found (Twitch)" });

                const thumb = meta.thumbnail_url;
                const slug = meta.url.split("/").pop();
                const candidates = [
                    thumb.split("-preview")[0] + ".mp4",
                    `https://clips-media-assets2.twitch.tv/clip-${slug}.mp4`,
                    `https://production.assets.clips.twitchcdn.net/${slug}.mp4`
                ];

                // Try each possible URL
                for (const url of candidates) {
                    try {
                        const probe = await fetch(url, { method: "HEAD" });
                        if (probe.ok) {
                            mp4 = url;
                            break;
                        }
                    } catch (_) { }
                }

                // If still no URL, try extracting from embed
                if (!mp4) {
                    const embedUrl = `https://clips.twitch.tv/embed?clip=${slug}&parent=${req.headers.host || "localhost"}`;
                    const html = await fetch(embedUrl).then(r => r.text());
                    const m = html.match(/<source\s+src="([^"]+\.mp4\?sig=[^"]+)"/);
                    if (m) mp4 = m[1];
                }

                if (!mp4) return res.status(404).json({ error: "No valid video URL found" });

                // Update the database with the found URL
                await Clip.updateOne({ clipId }, { $set: { downloadUrl: mp4 } }, { upsert: true });
            }
        }

        // For mobile devices, redirect to the video URL with download-friendly headers
        // This avoids the 4MB API route limit and lets the browser handle the download
        const filename = `${clip.streamerName}_${clipId}.mp4`.replace(/[^a-zA-Z0-9._-]/g, '_');

        // Set headers to suggest this should be downloaded
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache');

        // Redirect to the actual video URL - the browser will handle the download
        return res.redirect(mp4);
    } catch (err) {
        console.error("Mobile download error:", err);
        res.status(500).json({ error: "Download failed" });
    }
}
