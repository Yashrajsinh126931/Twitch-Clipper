import { parse } from 'cookie';

export function isLoggedIn(req) {
    const cookies = parse(req?.headers?.cookie || '');
    return Boolean(cookies.twitch_token);
}
