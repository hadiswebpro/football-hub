const API_BASE = "https://v3.football.api-sports.io";
const API_KEY = "";

const memoryCache = new Map();
const pendingRequests = new Map();

const TTL = {
    reference: 24 * 60 * 60 * 1000,
    stable: 60 * 60 * 1000,
    fixtures: 2 * 60 * 1000,
    live: 30 * 1000,
    details: 60 * 1000
};

function getCacheKey(path) {
    return path;
}

async function request(path, ttl = TTL.stable) {
    const key = getCacheKey(path);
    const now = Date.now();
    const cached = memoryCache.get(key);

    if (cached && cached.expiresAt > now) return cached.data;

    if (pendingRequests.has(key)) return pendingRequests.get(key);

    const promise = fetch(`${API_BASE}${path}`, {
        headers: { "x-apisports-key": API_KEY }
    }).then(async (response) => {
        const remaining = response.headers.get("x-ratelimit-requests-remaining");
        if (remaining !== null) {
            window.__footballHubApiQuota = Number(remaining);
        }

        if (!response.ok) {
            throw new Error(`Football API request failed: ${response.status}`);
        }

        const data = await response.json();
        if (data.errors && Object.keys(data.errors).length > 0) {
            throw new Error("Football API returned an error.");
        }

        memoryCache.set(key, { data, expiresAt: Date.now() + ttl });
        return data;
    }).finally(() => {
        pendingRequests.delete(key);
    });

    pendingRequests.set(key, promise);
    return promise;
}

function clearApiCache() {
    memoryCache.clear();
}

export { request, clearApiCache, TTL };
export default request;
