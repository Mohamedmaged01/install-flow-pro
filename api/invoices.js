// Vercel Serverless Function — APEX Invoices Proxy
const APEX_URL = 'https://gate.erp-apex.com/InvoiceServices/GetInvoices';
const PASS_KEY = '#@$DSFW%#@5423asfsa3252534$#%$#&^#@@!#%WEDFsdfsdgfascxvxvxwjsgdnhtecvxzterujhrjn';

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        return res.status(200).end();
    }

    const pn = req.query.PageNumber || req.query.PassKey ? (req.query.PageNumber || '1') : '1';
    const ps = req.query.PageSize || '20';
    const df = req.query.DateFrom;
    const dt = req.query.DateTo;

    // Build URL with encodeURIComponent (matches the format that works)
    let url = APEX_URL + '?PassKey=' + encodeURIComponent(PASS_KEY)
        + '&PageNumber=' + encodeURIComponent(pn)
        + '&PageSize=' + encodeURIComponent(ps);
    if (df) url += '&DateFrom=' + encodeURIComponent(df);
    if (dt) url += '&DateTo=' + encodeURIComponent(dt);

    try {
        const r = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });
        const data = await r.text();
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'public, s-maxage=60');
        return res.status(200).send(data);
    } catch (err) {
        return res.status(500).json({ isSuccess: false, message: err.message, data: null });
    }
};
