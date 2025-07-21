// import tmi from 'tmi.js';

// const activeMonitors = {};

// /**
//  * Starts monitoring Twitch chat for a specific streamer.
//  * Triggers onClip() callback when a spike is detected.
//  * Triggers onStatsUpdate() every interval with rate/baseline/spike info.
//  *
//  * @param {string} streamerUsername
//  * @param {string} token - Twitch user OAuth token
//  * @param {string} broadcasterId
//  * @param {Function} onClip - called when a clip should be created
//  * @param {Function} onStatsUpdate - called with stats each interval
//  */
// export function startChatMonitor(streamerUsername, token, broadcasterId, onClip, onStatsUpdate) {
//     if (activeMonitors[streamerUsername]) {
//         console.log(`🔁 Already monitoring ${streamerUsername}`);
//         return;
//     }

//     let baselineRate = 0;
//     let messageTimestamps = [];
//     let cooldown = false;
//     const INTERVAL = 10_000;

//     const client = new tmi.Client({
//         connection: { reconnect: true, secure: true },
//         channels: [streamerUsername],
//     });

//     client.connect()
//         .then(() => console.log(`📡 Monitoring started for ${streamerUsername}`))
//         .catch(err => console.error(`❌ Failed to connect to ${streamerUsername}'s chat`, err));

//     client.on('message', (_, __, ___, self) => {
//         if (!self) messageTimestamps.push(Date.now());
//     });

//     const interval = setInterval(() => {
//         const now = Date.now();
//         messageTimestamps = messageTimestamps.filter(ts => now - ts <= INTERVAL);
//         const currentRate = messageTimestamps.length;

//         // Exponential moving average
//         const alpha = 0.2;
//         baselineRate = baselineRate === 0 ? currentRate : (1 - alpha) * baselineRate + alpha * currentRate;

//         const spikeDetected = currentRate > baselineRate * 2.5 && currentRate > 10;

//         const message = `[${streamerUsername}] Rate: ${currentRate}/10s | Baseline: ${baselineRate.toFixed(2)} | Spike: ${spikeDetected}`;
//         console.log(message);

//         // ✅ Send to frontend
//         if (onStatsUpdate) {
//             onStatsUpdate({ streamer: streamerUsername, count: currentRate, baseline: baselineRate, spike: spikeDetected });
//         }

//         if (spikeDetected && !cooldown) {
//             console.log(`🚀 Clipping ${streamerUsername}`);
//             onClip();
//             cooldown = true;
//             setTimeout(() => cooldown = false, 60_000);
//         }
//     }, INTERVAL);

//     activeMonitors[streamerUsername] = { client, interval };
// }

// export function stopChatMonitor(streamerUsername) {
//     const monitor = activeMonitors[streamerUsername];
//     if (monitor) {
//         clearInterval(monitor.interval);
//         monitor.client.disconnect();
//         delete activeMonitors[streamerUsername];
//         console.log(`🛑 Monitoring stopped for ${streamerUsername}`);
//     }
// }

/* utils/chatMonitor.js  —  per-streamer adaptive thresholds */
import tmi from 'tmi.js';
const active = {};                        // login → { client, interval }

/* ------------------------------------------------ stats helpers */
function makeStats() {
    return { n: 0, mean: 0, m2: 0 };        // Welford container
}
function push(stats, x) {
    stats.n++;
    const d = x - stats.mean;
    stats.mean += d / stats.n;
    stats.m2 += d * (x - stats.mean);
}
function sd(stats) {
    return stats.n > 1 ? Math.sqrt(stats.m2 / (stats.n - 1)) : 0;
}

/* ------------------------------------------------- monitor */
export function startChatMonitor(
    login,
    token,
    _broadcasterId,
    onClip = () => { },
    onStats = () => { },
    opts = {},
) {
    if (active[login]) return;

    /* parameters (global defaults, override per call) */
    const cfg = {
        intervalMs: 6_000,
        minWarmupWin: 3,
        zChat: 1.5,       // chat z-score to flag
        zSubs: 2.0,       // subs z-score
        zBits: 2.0,       // bits z-score
        hypeThresh: 0.48,
        weights: { chat: 0.5, subs: 0.3, bits: 0.2 },
        cooldownMs: 40_000,
        ...opts,
    };

    /* ---------------------------------------- rolling window data */
    let msgTimes = [];
    let subsWin = 0;
    let bitsWin = 0;

    /* per-metric running stats (mean / sd) */
    const chatStats = makeStats();
    const subStats = makeStats();
    const bitStats = makeStats();

    /* tmi socket */
    const client = new tmi.Client({
        connection: { reconnect: true, secure: true },
        channels: [login],
    });

    client.on('message', (_c, _t, _m, self) => { if (!self) msgTimes.push(Date.now()); });
    ['subscription', 'subgift', 'submysterygift'].forEach(ev =>
        client.on(ev, () => { subsWin += 1; }));
    client.on('cheer', (_c, s) => { bitsWin += Number(s.bits) || 0; });

    client.connect().then(() => console.log(`📡 ${login} connected`));

    /* main loop */
    let windows = 0, cooldown = false;
    const interval = setInterval(() => {
        const now = Date.now();
        msgTimes = msgTimes.filter(ts => now - ts <= cfg.intervalMs);
        const rate = msgTimes.length;

        /* update running stats */
        push(chatStats, rate);
        push(subStats, subsWin);
        push(bitStats, bitsWin);
        windows++;

        /* compute z-scores (0 if sd==0) */
        const zChat = sd(chatStats) ? (rate - chatStats.mean) / sd(chatStats) : 0;
        const zSubs = sd(subStats) ? (subsWin - subStats.mean) / sd(subStats) : 0;
        const zBits = sd(bitStats) ? (bitsWin - bitStats.mean) / sd(bitStats) : 0;

        /* normalise to 0-1 */
        const chatScore = 1 / (1 + Math.exp(-zChat));                 // sigmoid
        const subsScore = 1 - Math.exp(-subsWin / (subStats.mean || 1)); // rises quicker if mean small
        const bitsScore = 1 - Math.exp(-bitsWin / ((bitStats.mean || 1) + 100));

        const hype = (
            cfg.weights.chat * chatScore +
            cfg.weights.subs * subsScore +
            cfg.weights.bits * bitsScore
        ) / (cfg.weights.chat + cfg.weights.subs + cfg.weights.bits);

        /* decide */
        const spike =
            windows >= cfg.minWarmupWin && (
                zChat >= cfg.zChat ||
                zSubs >= cfg.zSubs ||
                zBits >= cfg.zBits ||
                hype >= cfg.hypeThresh
            );

        onStats({
            streamer: login,
            rate, subs: subsWin, bits: bitsWin,
            zChat, zSubs, zBits,
            baseline: chatStats.mean,
            hype, spike,
        });

        if (spike && !cooldown) {
            onClip();
            cooldown = true;
            setTimeout(() => { cooldown = false; }, cfg.cooldownMs);
        }

        /* reset window counters */
        subsWin = bitsWin = 0;
    }, cfg.intervalMs);

    active[login] = { client, interval };
}

export function stopChatMonitor(login) {
    const m = active[login];
    if (!m) return;
    clearInterval(m.interval);
    m.client.disconnect();
    delete active[login];
    console.log(`🛑 ${login} monitor stopped`);
}
