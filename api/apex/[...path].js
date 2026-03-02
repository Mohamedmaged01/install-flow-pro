// Vercel Serverless Function — APEX ERP Proxy
// Keeps PassKey server-side, forwards requests to gate.erp-apex.com

const APEX_BASE = 'https://gate.erp-apex.com';
const PASS_KEY = '#@$DSFW%#@5423asfsa3252534$#%$#&^#@@!#%WEDFsdfsdgfascxvxvxwjsgdnhtecvxzterujhrjn';

module.exports = async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    // The [...path] catch-all gives us the APEX endpoint path
    const pathSegments = req.query.path;
    const apexPath = Array.isArray(pathSegments) ? pathSegments.join('/') : (pathSegments || '');

    // Build query string manually to avoid double-encoding
    const queryParts = ['PassKey=' + encodeURIComponent(PASS_KEY)];
    for (const [key, val] of Object.entries(req.query)) {
        if (key !== 'path' && val !== undefined && val !== '') {
            queryParts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(val)));
        }
    }

    const url = APEX_BASE + '/' + apexPath + '?' + queryParts.join('&');

    try {
        const apexRes = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const text = await apexRes.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { isSuccess: false, message: 'Invalid JSON from APEX', data: null };
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'public, s-maxage=60');

        return res.status(200).json(data);
    } catch (err) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            isSuccess: false,
            message: 'Proxy error: ' + (err.message || 'Unknown error'),
            data: null,
        });
    }
};
