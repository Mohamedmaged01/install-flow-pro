// Vercel Serverless Function — APEX Invoices Proxy
const https = require('https');

const APEX_HOST = 'gate.erp-apex.com';
const APEX_PATH = '/InvoiceServices/GetInvoices';
const PASS_KEY = '#@$DSFW%#@5423asfsa3252534$#%$#&^#@@!#%WEDFsdfsdgfascxvxvxwjsgdnhtecvxzterujhrjn';

function apexRequest(queryString) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: APEX_HOST,
            port: 443,
            path: APEX_PATH + '?' + queryString,
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Connection': 'keep-alive',
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve(data));
        });

        req.on('error', reject);
        req.end();
    });
}

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).end();
    }

    const pn = req.query.PageNumber || '1';
    const ps = req.query.PageSize || '20';
    const df = req.query.DateFrom;
    const dt = req.query.DateTo;

    let qs = 'PassKey=' + encodeURIComponent(PASS_KEY)
        + '&PageNumber=' + encodeURIComponent(pn)
        + '&PageSize=' + encodeURIComponent(ps);
    if (df) qs += '&DateFrom=' + encodeURIComponent(df);
    if (dt) qs += '&DateTo=' + encodeURIComponent(dt);

    try {
        const data = await apexRequest(qs);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(data);
    } catch (err) {
        return res.status(500).json({ isSuccess: false, message: err.message, data: null });
    }
};
