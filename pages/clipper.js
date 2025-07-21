import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Clipper() {
    const router = useRouter();

    const [token, setToken] = useState('');

    useEffect(() => {
        fetch('/api/token')
            .then(res => res.json())
            .then(data => {
                if (data.token) setToken(data.token);
                else alert('You must log in first');
            });
    }, []);

    const [broadcasterId, setBroadcasterId] = useState('');
    const [clipUrl, setClipUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const { streamer } = router.query;
    const [streamerUsername, setStreamerUsername] = useState('');

    useEffect(() => {
        if (router.isReady && streamer) {
            setStreamerUsername(streamer);
        }
    }, [router.isReady, streamer]);

    // Load Twitch player
    useEffect(() => {
        if (!streamerUsername) return;

        const script = document.createElement('script');
        script.src = 'https://embed.twitch.tv/embed/v1.js';
        script.onload = () => {
            new window.Twitch.Embed('twitch-embed', {
                width: '100%',
                height: 480,
                channel: streamerUsername,
                layout: 'video',
                autoplay: true,
            });
        };
        document.body.appendChild(script);
    }, [streamerUsername]);

    // Fetch broadcaster ID
    useEffect(() => {
        if (token && streamerUsername) {
            fetch(`/api/user-id?username=${streamerUsername}&token=${token}`)
                .then(res => res.json())
                .then(data => {
                    if (data.id) setBroadcasterId(data.id);
                    else alert('Failed to get broadcaster ID');
                });
        }
    }, [token, streamerUsername]);

    // Handle Clip Button
    const handleClip = async () => {
        if (!token || !broadcasterId) return;

        setLoading(true);
        const res = await fetch('/api/create-clip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token,
                broadcasterId,
                streamerName: streamerUsername, // ✅ added here
            }),
        });

        const data = await res.json();
        setLoading(false);

        if (data.url) {
            setClipUrl(data.url);
        } else {
            alert('Failed to create clip');
            console.error(data);
        }
    };

    return (
        <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <div id="twitch-embed" style={{ marginBottom: 20 }}></div>
            <button onClick={handleClip} disabled={loading}>
                {loading ? 'Clipping...' : '📹 Clip This Stream'}
            </button>
            {clipUrl && (
                <p>
                    ✅ Clip created: <a href={clipUrl} target="_blank">{clipUrl}</a>
                </p>
            )}
        </div>
    );
}
