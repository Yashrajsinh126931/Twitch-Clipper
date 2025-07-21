import { parse } from 'cookie';

export default function handler(req, res) {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.twitch_token;

    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    res.status(200).json({ token });
}
