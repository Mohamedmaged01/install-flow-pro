// Vercel Serverless Function — APEX ERP Proxy
// Keeps PassKey server-side and forwards requests to gate.erp-apex.com

const APEX_BASE = 'https://gate.erp-apex.com';
const PASS_KEY = '#@$DSFW%#@5423asfsa3252534$#%$#&^#@@!#%WEDFsdfsdgfascxvxvxwjsgdnhtecvxzterujhrjn';

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    // The [...path] catch-all gives us the APEX endpoint path
    const { path } = req.query;
    const apexPath = Array.isArray(path) ? path.join('/') : path;

    // Build query string: start with PassKey, then add remaining params
    const queryParts = ['PassKey=' + encodeURIComponent(PASS_KEY)];
    for (const [key, val] of Object.entries(req.query)) {
        if (key !== 'path' && val) {
            queryParts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(val)));
        }
    }

    const url = `${APEX_BASE}/${apexPath}?${queryParts.join('&')}`;

    try {
        const apexRes = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await apexRes.json();

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'public, s-maxage=60');

        return res.status(200).json(data);
    } catch (err) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            isSuccess: false,
            message: `Proxy error: ${err.message}`,
            data: null,
        });
    }
}
