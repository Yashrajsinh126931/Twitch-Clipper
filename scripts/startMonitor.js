import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { startChatMonitor } from '../utils/chatMonitor.js';

dotenv.config();

// Get environment variables
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const STREAMER_USERNAME = process.env.STREAMER_USERNAME;

async function main() {
    try {
        if (!STREAMER_USERNAME) {
            throw new Error('STREAMER_USERNAME is required in environment variables');
        }

        // 1. Get access token
        const tokenRes = await fetch(`${API_BASE_URL}/api/token`);
        if (!tokenRes.ok) throw new Error(`Failed to fetch token: ${tokenRes.status}`);
        const { token } = await tokenRes.json();

        // 2. Get broadcaster ID
        const userRes = await fetch(`${API_BASE_URL}/api/user-id?username=${STREAMER_USERNAME}&token=${token}`);
        if (!userRes.ok) throw new Error(`Failed to fetch user ID: ${userRes.status}`);
        const { id: broadcasterId } = await userRes.json();

        // 3. Start monitor
        if (token && broadcasterId) {
            startChatMonitor(STREAMER_USERNAME, token, broadcasterId);
            console.log(`✅ Started chat monitor for ${STREAMER_USERNAME}`);
        } else {
            throw new Error('Missing token or broadcasterId');
        }
    } catch (error) {
        console.error('❌ Failed to start monitor:', error.message);
        process.exit(1);
    }
}

main();
