// // import { getAppAccessToken } from '../../lib/twitch';
// // import { connectToDatabase } from '../../lib/mongodb';
// // import Streamer from '../../models/Streamer';

// // export default async function handler(req, res) {
// //     try {
// //         const token = await getAppAccessToken();

// //         const twitchResponse = await fetch(
// //             'https://api.twitch.tv/helix/streams?first=10',
// //             {
// //                 headers: {
// //                     'Client-ID': process.env.TWITCH_CLIENT_ID,
// //                     'Authorization': `Bearer ${token}`,
// //                 },
// //             }
// //         );

// //         const data = await twitchResponse.json();

// //         await connectToDatabase();
// //         const streamsByGame = {};


// //         data.data.forEach((stream) => {
// //             const game = stream.game_name || 'Unknown';
// //             if (!streamsByGame[game]) streamsByGame[game] = [];
// //             streamsByGame[game].push(stream);
// //         });

// //         const topStreams = Object.values(streamsByGame).flatMap((categoryStreams) =>
// //             categoryStreams
// //                 .sort((a, b) => b.viewer_count - a.viewer_count)
// //                 .slice(0, 3) // keep top 3 per game
// //         );

// //         const oneWeekAgo = new Date();
// //         oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);



// //         const formatted = await Promise.all(data.data.map(async (stream) => {
// //             const oneWeekAgo = new Date();
// //             oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

// //             const recentEntries = await Streamer.find({
// //                 name: stream.user_name,
// //                 timestamp: { $gte: oneWeekAgo },
// //             });

// //             const avgViewers = recentEntries.length > 0
// //                 ? recentEntries.reduce((sum, entry) => sum + entry.viewers, 0) / recentEntries.length
// //                 : stream.viewer_count;

// //             const clipScore = avgViewers > 0
// //                 ? (stream.viewer_count / avgViewers).toFixed(2)
// //                 : 1;

// //             // 🔒 Limit unnecessary DB writes
// //             const latest = await Streamer.findOne({ name: stream.user_name }).sort({ timestamp: -1 });
// //             const lastViewers = latest?.viewers ?? 0;
// //             const lastTime = latest?.timestamp || new Date(0);
// //             const now = new Date();
// //             const timeDiff = (now - lastTime) / (1000 * 60); // minutes
// //             const viewerDiffPercent = Math.abs(stream.viewer_count - lastViewers) / Math.max(lastViewers, 1);

// //             if (timeDiff >= 5 || viewerDiffPercent > 0.1) {
// //                 await Streamer.create({
// //                     name: stream.user_name,
// //                     game: stream.game_name,
// //                     title: stream.title,
// //                     viewers: stream.viewer_count,
// //                     score: clipScore,
// //                 });
// //             }

// //             return {
// //                 name: stream.user_name,
// //                 game: stream.game_name,
// //                 title: stream.title,
// //                 viewers: stream.viewer_count,
// //                 avgViewers,
// //                 clip_score: clipScore,
// //                 url: `https://twitch.tv/${stream.user_login}`,
// //                 startedAt: stream.started_at,
// //             };
// //         }));


// //         res.status(200).json(formatted);

// //     } catch (err) {
// //         console.error('Error fetching streams:', err.message);
// //         res.status(500).json({ error: 'Failed to fetch Twitch streams' });
// //     }
// // }


// import { exec } from 'child_process';
// import { connectToDatabase } from '../../lib/mongodb';
// import Streamer from '../../models/Streamer';

// // Get Twitch token using curl (Windows-safe)
// async function getAppAccessToken() {
//     const client_id = process.env.TWITCH_CLIENT_ID;
//     const client_secret = process.env.TWITCH_CLIENT_SECRET;

//     const curlCommand = `curl -X POST "https://id.twitch.tv/oauth2/token" -H "Content-Type: application/x-www-form-urlencoded" -d "client_id=${client_id}" -d "client_secret=${client_secret}" -d "grant_type=client_credentials"`;

//     return new Promise((resolve, reject) => {
//         exec(curlCommand, (error, stdout) => {
//             if (error) return reject(error);
//             try {
//                 const json = JSON.parse(stdout);
//                 resolve(json.access_token);
//             } catch (e) {
//                 reject(e);
//             }
//         });
//     });
// }

// export default async function handler(req, res) {
//     try {
//         const token = await getAppAccessToken();

//         // Fetch top 100 live streams
//         const twitchRes = await fetch('https://api.twitch.tv/helix/streams?first=100', {
//             headers: {
//                 'Client-ID': process.env.TWITCH_CLIENT_ID,
//                 'Authorization': `Bearer ${token}`,
//             },
//         });

//         const json = await twitchRes.json();
//         const allStreams = json.data;

//         // Group by category and select top 3 per game
//         const streamsByGame = {};
//         allStreams.forEach((stream) => {
//             const game = stream.game_name || 'Unknown';
//             if (!streamsByGame[game]) streamsByGame[game] = [];
//             streamsByGame[game].push(stream);
//         });

//         const topStreams = Object.values(streamsByGame).flatMap((categoryStreams) =>
//             categoryStreams
//                 .sort((a, b) => b.viewer_count - a.viewer_count)
//                 .slice(0, 3)
//         );

//         await connectToDatabase();

//         const oneWeekAgo = new Date();
//         oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

//         const result = await Promise.all(
//             topStreams.map(async (stream) => {
//                 const recentEntries = await Streamer.find({
//                     name: stream.user_name,
//                     timestamp: { $gte: oneWeekAgo },
//                 });

//                 const avgViewers =
//                     recentEntries.length > 0
//                         ? recentEntries.reduce((sum, e) => sum + e.viewers, 0) / recentEntries.length
//                         : stream.viewer_count;

//                 const clipScore = avgViewers > 0
//                     ? (stream.viewer_count / avgViewers).toFixed(2)
//                     : 1;

//                 // Trend detection
//                 const latest = await Streamer.findOne({ name: stream.user_name }).sort({ timestamp: -1 });
//                 const lastViewers = latest?.viewers ?? 0;
//                 const lastTime = latest?.timestamp || new Date(0);
//                 const now = new Date();
//                 const timeDiffMins = (now - lastTime) / (1000 * 60);
//                 const viewerDiffPercent = Math.abs(stream.viewer_count - lastViewers) / Math.max(lastViewers, 1);

//                 const trend =
//                     stream.viewer_count > lastViewers ? 'rising' :
//                         stream.viewer_count < lastViewers ? 'falling' : 'steady';

//                 // Save only if 10% diff or 5+ mins have passed
//                 if (timeDiffMins >= 5 || viewerDiffPercent > 0.1) {
//                     await Streamer.create({
//                         name: stream.user_name,
//                         game: stream.game_name,
//                         title: stream.title,
//                         viewers: stream.viewer_count,
//                         score: clipScore,
//                         timestamp: now,
//                     });
//                 }

//                 return {
//                     name: stream.user_name,
//                     game: stream.game_name,
//                     title: stream.title,
//                     viewers: stream.viewer_count,
//                     avgViewers: Math.round(avgViewers),
//                     clip_score: clipScore,
//                     trend,
//                     url: `https://twitch.tv/${stream.user_login}`,
//                     startedAt: stream.started_at,
//                 };
//             })
//         );

//         res.status(200).json(result);
//     } catch (error) {
//         console.error('Error fetching streams:', error);
//         res.status(500).json({ error: 'Failed to fetch Twitch streams' });
//     }
// }
import { exec } from 'child_process';
import { connectToDatabase } from '../../lib/mongodb';
import Streamer from '../../models/Streamer';

function getAppAccessToken() {
    const client_id = process.env.TWITCH_CLIENT_ID;
    const client_secret = process.env.TWITCH_CLIENT_SECRET;

    const curlCommand = `curl -s -X POST "https://id.twitch.tv/oauth2/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "client_id=${client_id}" \
    -d "client_secret=${client_secret}" \
    -d "grant_type=client_credentials"`;

    return new Promise((resolve, reject) => {
        exec(curlCommand, (err, stdout) => {
            if (err) {
                console.error('Curl error:', err);
                return reject(new Error('Failed to get Twitch token'));
            }
            try {
                const { access_token } = JSON.parse(stdout);
                resolve(access_token);
            } catch (parseErr) {
                console.error('Failed to parse Twitch token response:', stdout);
                reject(new Error('Failed to parse Twitch token'));
            }
        });
    });
}

export default async function handler(req, res) {
    try {
        await connectToDatabase();
        const token = await getAppAccessToken();

        const twitchRes = await fetch('https://api.twitch.tv/helix/streams?first=100', {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!twitchRes.ok) throw new Error('Twitch API request failed');

        const { data: allStreams } = await twitchRes.json();

        // Group by game
        const streamsByGame = allStreams.reduce((acc, stream) => {
            const game = stream.game_name || 'Unknown';
            if (!acc[game]) acc[game] = [];
            acc[game].push(stream);
            return acc;
        }, {});

        // Take top 3 streams per game
        const topStreams = Object.values(streamsByGame)
            .flatMap((streams) => streams
                .sort((a, b) => b.viewer_count - a.viewer_count)
                .slice(0, 3)
            );

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const now = new Date();

        const results = await Promise.all(
            topStreams.map(async (stream) => {
                const name = stream.user_name;

                const [latest, recentEntries] = await Promise.all([
                    Streamer.findOne({ name }).sort({ timestamp: -1 }),
                    Streamer.find({ name, timestamp: { $gte: oneWeekAgo } }),
                ]);

                const avgViewers = recentEntries.length
                    ? recentEntries.reduce((sum, entry) => sum + entry.viewers, 0) / recentEntries.length
                    : stream.viewer_count;

                const clipScore = avgViewers > 0
                    ? (stream.viewer_count / avgViewers).toFixed(2)
                    : '1.00';

                const lastViewers = latest?.viewers ?? 0;
                const lastTime = latest?.timestamp ?? new Date(0);
                const timeDiffMins = (now - lastTime) / (1000 * 60);
                const viewerDiffPercent = Math.abs(stream.viewer_count - lastViewers) / Math.max(lastViewers, 1);

                const trend = stream.viewer_count > lastViewers
                    ? 'rising'
                    : stream.viewer_count < lastViewers
                        ? 'falling'
                        : 'steady';

                // Save only if 10% change or 5+ mins have passed
                if (timeDiffMins >= 5 || viewerDiffPercent > 0.1) {
                    await Streamer.create({
                        name,
                        game: stream.game_name,
                        title: stream.title,
                        viewers: stream.viewer_count,
                        score: clipScore,
                        timestamp: now,
                    });
                }

                return {
                    name,
                    game: stream.game_name,
                    title: stream.title,
                    viewers: stream.viewer_count,
                    avgViewers: Math.round(avgViewers),
                    clip_score: clipScore,
                    trend,
                    url: `https://twitch.tv/${stream.user_login}`,
                    startedAt: stream.started_at,
                };
            })
        );

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching streams:', error);
        res.status(500).json({ error: 'Failed to fetch Twitch streams' });
    }
}
