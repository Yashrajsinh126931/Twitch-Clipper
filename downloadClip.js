import fetch from "node-fetch";
import { parse } from "cookie";
import { connectToDatabase } from "../../lib/mongodb";
import Clip from "../../models/Clip";

const EXTERNAL_API_BASE = "https://0np5twiut4.execute-api.us-east-1.amazonaws.com/dev/api/v2/media/fetch/secure-token-xyz789";

export default async function handler(req, res) {
    // Handle both GET and POST methods
    if (req.method !== "GET" && req.method !== "POST") {
        return res.status(405).json({ error: "Only GET and POST supported" });
    }

    // Get clipId from query params for GET or from body for POST
    const clipId = req.method === "GET" 
        ? req.query.clipId 
        : req.body?.clipId;

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

        // Fetch from external API or Twitch if downloadUrl is missing
        if (!mp4) {
            try {
                const extRes = await fetch(`${EXTERNAL_API_BASE}?id=${clipId}`);
                const extJson = await extRes.json();
                const extClip = extJson?.data?.[0];
                mp4 = extClip?.video_url || null;
            } catch (err) {
                console.warn("External API fetch failed:", err);
            }

            if (!mp4) {
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

                for (const url of candidates) {
                    try {
                        const probe = await fetch(url, { method: "HEAD" });
                        if (probe.ok) {
                            mp4 = url;
                            break;
                        }
                    } catch (_) { }
                }

                if (!mp4) {
                    const embedUrl = `https://clips.twitch.tv/embed?clip=${slug}&parent=${req.headers.host || "localhost"}`;
                    const html = await fetch(embedUrl).then(r => r.text());
                    const m = html.match(/<source\s+src="([^"]+\.mp4\?sig=[^"]+)"/);
                    if (m) mp4 = m[1];
                }

                if (!mp4) return res.status(404).json({ error: "No valid video URL found" });

                await Clip.updateOne({ clipId }, { $set: { downloadUrl: mp4 } }, { upsert: true });
            }
        }

        // Different handling based on request method
        if (req.method === "GET") {
            // Redirect for iOS (existing behavior)
            return res.redirect(mp4);
        } else {
            // For POST: stream the video content as a response
            try {
                const videoResponse = await fetch(mp4);
                
                if (!videoResponse.ok) {
                    throw new Error(`Failed to fetch video: ${videoResponse.status}`);
                }
                
                // Get content type and length from response headers
                const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
                const contentLength = videoResponse.headers.get('content-length');
                
                // Set response headers
                res.setHeader('Content-Type', contentType);
                if (contentLength) {
                    res.setHeader('Content-Length', contentLength);
                }
                
                // Stream the video data to the client
                const videoStream = videoResponse.body;
                videoStream.pipe(res);
                
                // Handle potential stream errors
                videoStream.on('error', (err) => {
                    console.error('Stream error:', err);
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Video streaming failed' });
                    } else {
                        res.end();
                    }
                });
            } catch (err) {
                console.error("POST download stream error:", err);
                res.status(500).json({ error: "Failed to stream video content" });
            }
        }
    } catch (err) {
        console.error(`${req.method} download error:`, err);
        res.status(500).json({ error: "Download failed" });
    }
}
