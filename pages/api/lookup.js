import { exec } from 'child_process';

async function getAppAccessToken() {
    const client_id = process.env.TWITCH_CLIENT_ID;
    const client_secret = process.env.TWITCH_CLIENT_SECRET;

    const curlCommand = `curl -s -X POST "https://id.twitch.tv/oauth2/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "client_id=${client_id}" \
    -d "client_secret=${client_secret}" \
    -d "grant_type=client_credentials"`;

    return new Promise((resolve, reject) => {
        exec(curlCommand, (err, stdout) => {
            if (err) return reject(new Error('Token fetch failed'));
            try {
                const { access_token } = JSON.parse(stdout);
                resolve(access_token);
            } catch (e) {
                reject(e);
            }
        });
    });
}

export default async function handler(req, res) {
    const { name } = req.query;

    try {
        const token = await getAppAccessToken();
        const headers = {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            Authorization: `Bearer ${token}`,
        };

        // Step 1: Fetch user info
        const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${name}`, { headers });
        const userData = await userRes.json();
        const user = userData.data?.[0];

        if (!user) return res.status(404).json({ error: 'User not found' });

        // Step 2: Check if user is live
        const streamRes = await fetch(`https://api.twitch.tv/helix/streams?user_login=${name}`, { headers });
        const streamData = await streamRes.json();
        const stream = streamData.data?.[0] || null;

        res.status(200).json({
            profile: user,
            live: !!stream,
            stream,
        });
    } catch (err) {
        console.error('Lookup error:', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
}
