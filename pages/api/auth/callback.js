import { exec } from 'child_process';
import { serialize } from 'cookie';

export default function handler(req, res) {
    const { code, state } = req.query; // state = return path
    const nextUrl = state || '/';

    if (!code) {
        return res.status(400).send('Missing Twitch authorization code.');
    }

    const client_id = process.env.TWITCH_CLIENT_ID;
    const client_secret = process.env.TWITCH_CLIENT_SECRET;
    const redirect_uri = process.env.TWITCH_REDIRECT_URI;

    const curlCommand = `curl -s -X POST "https://id.twitch.tv/oauth2/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "client_id=${client_id}" \
    -d "client_secret=${client_secret}" \
    -d "code=${code}" \
    -d "grant_type=authorization_code" \
    -d "redirect_uri=${redirect_uri}"`;

    exec(curlCommand, (err, stdout) => {
        if (err) {
            console.error('Curl error:', err);
            return res.status(500).send('Authentication failed');
        }

        try {
            const data = JSON.parse(stdout);
            const { access_token } = data;

            if (!access_token) {
                console.error('Twitch token error:', data);
                return res.status(500).send('Failed to get access token');
            }

            // Set HTTP-only cookie
            res.setHeader('Set-Cookie', serialize('twitch_token', access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 3600, // 1 hour
            }));

            res.redirect(nextUrl);

        } catch (e) {
            console.error('Failed to parse token response:', stdout);
            res.status(500).send('Auth parse error');
        }
    });
}
