// Vercel Serverless Function — APEX Invoices Proxy
const APEX_URL = 'https://gate.erp-apex.com/InvoiceServices/GetInvoices';
const PASS_KEY = '#@$DSFW%#@5423asfsa3252534$#%$#&^#@@!#%WEDFsdfsdgfascxvxvxwjsgdnhtecvxzterujhrjn';

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        return res.status(200).end();
    }

    const { PageNumber = '1', PageSize = '20', DateFrom, DateTo } = req.query;
    const params = new URLSearchParams();
    params.set('PassKey', PASS_KEY);
    params.set('PageNumber', String(PageNumber));
    params.set('PageSize', String(PageSize));
    if (DateFrom) params.set('DateFrom', String(DateFrom));
    if (DateTo) params.set('DateTo', String(DateTo));

    try {
        const r = await fetch(APEX_URL + '?' + params.toString());
        const data = await r.text();
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'public, s-maxage=60');
        return res.status(200).send(data);
    } catch (err) {
        return res.status(500).json({ isSuccess: false, message: err.message, data: null });
    }
};
