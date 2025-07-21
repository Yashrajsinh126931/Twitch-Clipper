export default async function handler(req, res) {
    const { username, token } = req.query;

    const response = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
        headers: {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await response.json();
    const user = data.data?.[0];

    if (user) res.status(200).json({ id: user.id });
    else res.status(404).json({ error: 'Streamer not found' });
}
