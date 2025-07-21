import { exec } from 'child_process';

export async function getAppAccessToken() {
    const client_id = process.env.TWITCH_CLIENT_ID;
    const client_secret = process.env.TWITCH_CLIENT_SECRET;

    const curlCommand = `curl -X POST "https://id.twitch.tv/oauth2/token" -H "Content-Type: application/x-www-form-urlencoded" -d "client_id=${client_id}" -d "client_secret=${client_secret}" -d "grant_type=client_credentials"`;

    return new Promise((resolve, reject) => {
        exec(curlCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ CURL error:', error);
                return reject(error);
            }

            try {
                const json = JSON.parse(stdout);
                resolve(json.access_token);
            } catch (e) {
                console.error('❌ JSON parse error:', e);
                reject(e);
            }
        });
    });
}
